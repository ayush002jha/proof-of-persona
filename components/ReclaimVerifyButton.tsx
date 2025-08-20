// components/ReclaimVerifyButton.tsx
import React, { useState } from "react";
import { Button, Alert, ActivityIndicator, View } from "react-native";
import { ReclaimVerification } from "@reclaimprotocol/inapp-rn-sdk";
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useAbstraxionClient,
} from "@burnt-labs/abstraxion-react-native";
import { PersonaProvider } from "../constants/providers";
import { usePersona } from "../hooks/usePersona"; // Corrected relative path
import { generatePersonaScore } from "../services/scoreEngine"; // Corrected relative path

const APP_ID = process.env.EXPO_PUBLIC_RECLAIM_APP_ID!;
const APP_SECRET = process.env.EXPO_PUBLIC_RECLAIM_APP_SECRET!;
const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;

const reclaimVerification = new ReclaimVerification();

interface ReclaimVerifyButtonProps {
  provider: PersonaProvider;
  onVerificationComplete: () => void;
}

export const ReclaimVerifyButton: React.FC<ReclaimVerifyButtonProps> = ({
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

  const getButtonTitle = () => {
    if (status === "verifying") return "Follow instructions...";
    if (status === "scoring") return "Calculating Score...";
    if (status === "updating") return "Saving to Blockchain...";

    // --- THIS IS THE CORRECTED LOGIC ---
    // Check if the persona object exists, then check the nested verifications object.
    const isAlreadyVerified =
      persona && persona.verifications && persona.verifications[provider.key];

    return isAlreadyVerified
      ? `Re-Verify ${provider.name}`
      : `Verify with ${provider.name}`;
  };

  return (
    <View className="my-2">
      <Button
        title={getButtonTitle()}
        onPress={handleVerification}
        disabled={status !== "idle"}
      />
      {status !== "idle" && <ActivityIndicator className="mt-2" />}
    </View>
  );
};
