// components/ConnectionCard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReclaimVerification } from "@reclaimprotocol/inapp-rn-sdk";
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useAbstraxionClient,
} from "@burnt-labs/abstraxion-react-native";
import { PersonaProvider } from "../constants/providers";
import { usePersona } from "@/hooks/PersonaContext";
import { generatePersonaScore } from "../services/scoreEngine";

const APP_ID = process.env.EXPO_PUBLIC_RECLAIM_APP_ID!;
const APP_SECRET = process.env.EXPO_PUBLIC_RECLAIM_APP_SECRET!;
const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;

const reclaimVerification = new ReclaimVerification();

const getVerifiedContent = (provider: PersonaProvider, data: any) => {
  let username = `@${data.screenName || data.username || data.fullName || "Verified"}`;
  let detail = "";

  switch (provider.key) {
    case "twitter":
      detail = `${data.followers} followers`;
      break;
    case "github":
      detail = `${data.contributionsLastYear} contributions`;
      break;
    case "linkedin":
      detail = `${data.connections} connections`;
      break;
    case "binance":
      username = "KYC Status"; // Binance doesn't have a username in the proof
      detail = data.kycStatus;
      break;
    case "twitterTweets":
      username = "Recent Activity";
      detail = `${data.tweetCount} tweets found`;
      break;
    default:
      detail = "Verified";
  }

  return { username, detail };
};

interface ConnectionCardProps {
  provider: PersonaProvider;
  onVerificationComplete: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  provider,
  onVerificationComplete,
}) => {
  const { data: account } = useAbstraxionAccount();
  const { client: signingClient } = useAbstraxionSigningClient();
  const { client: queryClient } = useAbstraxionClient();
  const [status, setStatus] = useState<
    "idle" | "verifying" | "scoring" | "updating"
  >("idle");
  const { persona } = usePersona();

  const handleVerification = async () => {
    if (!account?.bech32Address || !signingClient || !queryClient) {
      return Alert.alert("Error", "Client not ready. Please try again.");
    }

    setStatus("verifying");
    try {
      const verificationResult = await reclaimVerification.startVerification({
        appId: APP_ID,
        secret: APP_SECRET,
        providerId: provider.id,
      });

      if (!verificationResult.proofs?.length) {
        throw new Error("Verification did not return any proofs.");
      }
      console.log("Verification Result:", verificationResult);
      console.log("Verification Result Proofs:", verificationResult.proofs);
      await updateDocuStore(verificationResult.proofs, account.bech32Address);
    } catch (error: any) {
      if (error instanceof ReclaimVerification.ReclaimVerificationException) {
        if (error.type !== ReclaimVerification.ExceptionType.Cancelled) {
          Alert.alert("Verification Failed", error.message);
        }
      } else {
        Alert.alert("Error", error.message || "Could not start verification.");
      }
      setStatus("idle");
    }
  };

  const updateDocuStore = async (proofs: any[], userAddress: string) => {
    // This query in the `usePersona` hook is sufficient. We can use the cached persona state.
    const existingPersona = persona || { verifications: {} };

    try {
      const proof = proofs[0];
      let newVerificationData = {};

      // The parameters are a stringified JSON, so we must parse them first.
      // 1. Parse the parameters string, as confirmed by your log.
      const parsedParams = JSON.parse(proof.claimData.parameters);
      // 2. Access the nested `paramValues` object inside the parsed result.
      const params = parsedParams.paramValues;
      console.log("Parsed Parameters:", params);
      switch (provider.key) {
        case "twitter":
          // This path is correct for Twitter
          const twitterParams = JSON.parse(
            proof.claimData.parameters
          ).paramValues;
          newVerificationData = {
            twitter: {
              followers: parseInt(twitterParams.followers_count, 10),
              screenName: twitterParams.screen_name,
              createdAt: twitterParams.created_at,
              verifiedAt: new Date().toISOString(),
            },
          };
          break;

        case "github":
          // The GitHub data is in the top-level `publicData` object
          const githubParams = proof.publicData;
          if (!githubParams) {
            throw new Error("GitHub proof is missing publicData.");
          }
          newVerificationData = {
            github: {
              username: githubParams.username,
              followers: parseInt(githubParams.followers, 10),
              contributionsLastYear: parseInt(
                githubParams.contributionsLastYear,
                10
              ),
              verifiedAt: new Date().toISOString(),
            },
          };
          break;
        case "binance":
          newVerificationData = {
            binance: {
              kycStatus: params.KYC_status,
              verifiedAt: new Date().toISOString(),
            },
          };
          break;
        case "linkedin":
          // 1. Access the top-level publicData object
          const linkedinPublicData = proof.publicData;
          if (!linkedinPublicData || !linkedinPublicData.linkedinUserData) {
            throw new Error(
              "LinkedIn proof is missing publicData.linkedinUserData."
            );
          }

          // 2. The user data is inside the linkedinUserData property
          const userData = linkedinPublicData.linkedinUserData;

          // 3. Extract the specific fields we need from the "hero" section
          newVerificationData = {
            linkedin: {
              headline: userData.hero.headline,
              connections: userData.hero.connections,
              fullName: userData.hero.fullName,
              geoLocation: userData.hero.geoLocation,
              verifiedAt: new Date().toISOString(),
            },
          };
          break;
        case "twitterTweets":
          // 1. Access the top-level publicData object
          const tweetsPublicData = proof.publicData;
          if (!tweetsPublicData || !tweetsPublicData.last20tweets) {
            throw new Error("Twitter Tweets proof is missing publicData.");
          }

          // 2. Extract the data we want to store on-chain
          const last20Tweets = tweetsPublicData.last20tweets;

          // 3. We can store a summary to save space and gas, rather than the full tweets
          newVerificationData = {
            twitterTweets: {
              tweetCount: last20Tweets.length,
              // Get the date of the most recent tweet to prove activity
              latestTweetDate:
                last20Tweets.length > 0 ? last20Tweets[0].createdAt : null,
              verifiedAt: new Date().toISOString(),
            },
          };
          break;
        default:
          throw new Error(`Provider key "${provider.key}" not handled.`);
      }

      const updatedVerifications = {
        ...existingPersona.verifications,
        ...newVerificationData,
      };

      setStatus("scoring");
      const personaScore = await generatePersonaScore(updatedVerifications);

      const finalPersonaDocument = {
        verifications: updatedVerifications,
        personaScore,
        lastUpdatedAt: new Date().toISOString(),
      };

      setStatus("updating");
      const writeMsg = {
        Set: {
          collection: "personas",
          document: userAddress,
          data: JSON.stringify(finalPersonaDocument),
        },
      };
      await signingClient!.execute(
        userAddress,
        DOCUSTORE_ADDRESS,
        writeMsg,
        "auto"
      );

      Alert.alert("Success!", "Your Persona has been updated on-chain.");
      onVerificationComplete();
    } catch (error: any) {
      Alert.alert("Update Error", error.message || "Failed to update persona.");
    } finally {
      setStatus("idle");
    }
  };

  const verificationData = persona?.verifications?.[provider.key];
  const isVerified = !!verificationData;
  const isLoading = status !== "idle"; // A single boolean to track if any action is in progress
  // Get the dynamic content for the card
  const { username, detail } = isVerified
    ? getVerifiedContent(provider, verificationData)
    : { username: "", detail: "" };

  return (
    <View className="bg-white p-5 rounded-2xl shadow-md border-[0.2px] mb-4">
      <View className="flex-row items-start">
        <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
          <Ionicons
            name={provider.iconName}
            size={28}
            color={provider.iconColor}
          />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">
            {provider.name}
          </Text>
          {isVerified ? (
            <>
              <Text className="text-sm text-gray-500">{username}</Text>
              <Text className="text-sm text-gray-500">{detail}</Text>
            </>
          ) : (
            <Text className="text-sm text-gray-500">
              {provider.description}
            </Text>
          )}
        </View>
        {isVerified &&
          !isLoading && ( // Only show the checkmark if verified AND not loading
            <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
      </View>

      {/* --- THIS IS THE CORRECTED LOGIC --- */}
      {isVerified ? (
        // --- VERIFIED STATE ---
        <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <Text className="text-xs text-gray-400">
            Verified on{" "}
            {new Date(verificationData.verifiedAt).toLocaleDateString()}
          </Text>

          {isLoading ? (
            <ActivityIndicator color="#6b7280" />
          ) : (
            <TouchableOpacity
              className="bg-gray-200 px-4 py-2 rounded-full"
              onPress={handleVerification}
              disabled={isLoading}
            >
              <Text className="text-gray-700 font-semibold">Re-verify</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        // --- UNVERIFIED STATE ---
        <TouchableOpacity
          className="bg-blue-500 mt-4 py-3 rounded-lg items-center"
          onPress={handleVerification}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Verify</Text>
          )}
        </TouchableOpacity>
      )}
      {/* --- END OF CORRECTION --- */}
    </View>
  );
};
