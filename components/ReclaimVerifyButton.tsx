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
          newVerificationData = {
            twitter: {
              followers: parseInt(params.followers_count, 10),
              screenName: params.screen_name,
              createdAt: params.created_at,
              verifiedAt: new Date().toISOString(),
            },
          };
          break;
        case "github":
          newVerificationData = {
            github: {
              username: params.username,
              followers: parseInt(params.followers),
              contributionsLastYear: parseInt(params.contributionsLastYear),
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
          newVerificationData = {
            linkedin: {
              headline: params.linkedinUserData.hero.headline,
              connections: params.linkedinUserData.hero.connections,
              verifiedAt: new Date().toISOString(),
            },
          };
          break;
        case "twitterTweets":
          newVerificationData = {
            twitterTweets: {
              tweetCount: params.last20tweets.length,
              latestTweetDate: params.last20tweets[0]?.createdAt,
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
