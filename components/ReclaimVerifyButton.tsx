// components/ReclaimVerifyButton.tsx
import React, { useState } from "react";
import { Button, Alert, ActivityIndicator, View } from "react-native";
// CORRECTED: Do NOT import Request, Proof, or any other types.
import { ReclaimVerification } from "@reclaimprotocol/inapp-rn-sdk";
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useAbstraxionClient,
} from "@burnt-labs/abstraxion-react-native";
import { PersonaProvider } from "../constants/providers";
import { usePersona } from "@/hooks/usePersona";

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
  const [status, setStatus] = useState<"idle" | "verifying" | "updating">(
    "idle"
  );

  // Use the hook to get the current persona state
  const { persona } = usePersona();

  const handleVerification = async () => {
    if (!account?.bech32Address || !signingClient || !queryClient) {
      return Alert.alert(
        "Error",
        "Wallet not connected or client not ready. Please try again."
      );
    }

    setStatus("verifying");
    try {
      // CORRECTED: Create the request object inline, without a type annotation.
      // TypeScript will infer the type from the startVerification method's signature.
      const verificationResult = await reclaimVerification.startVerification({
        appId: APP_ID,
        secret: APP_SECRET,
        providerId: provider.id,
      });

      if (
        !verificationResult.proofs ||
        verificationResult.proofs.length === 0
      ) {
        throw new Error("Verification did not return any proofs.");
      }

      await updateDocuStore(verificationResult.proofs, account.bech32Address);
    } catch (error: any) {
      if (error instanceof ReclaimVerification.ReclaimVerificationException) {
        switch (error.type) {
          case ReclaimVerification.ExceptionType.Cancelled:
            Alert.alert("Cancelled", "Verification was cancelled by the user.");
            break;
          default:
            Alert.alert(
              "Verification Failed",
              error.message || "An unknown Reclaim error occurred."
            );
        }
      } else {
        Alert.alert("Error", error.message || "Could not start verification.");
      }
      setStatus("idle");
    }
  };

  const updateDocuStore = async (proofs: any[], userAddress: string) => {
    setStatus("updating");
    try {
      let existingPersona: any = {};
      try {
        const res = await queryClient!.queryContractSmart(DOCUSTORE_ADDRESS, {
          read: { collection: "personas", document_id: userAddress }, // 'read' still uses 'document_id'
        });
        if (res.data) existingPersona = JSON.parse(res.data);
      } catch (e) {
        /* New user, no existing persona. This is fine. */
      }

      const proof = proofs[0];
      let newData = {};

      if (provider.id === "e6fe962d-8b4e-4ce5-abcc-3d21c88bd64a") {
        // Twitter
        const contextData = JSON.parse(proof.claimData.context);
        const params = contextData.extractedParameters;
        newData = {
          twitter: {
            followers: parseInt(params.followers_count, 10),
            verifiedAt: new Date().toISOString(),
          },
        };
      }
      // ... Add other provider cases here

      const updatedPersona = {
        ...existingPersona,
        ...newData,
        lastUpdatedAt: new Date().toISOString(),
      };

      // --- THIS IS THE CRITICAL FIX ---
      // The command must be "Set" (with a capital S)
      // The document identifier key must be "document"
      const writeMsg = {
        Set: {
          collection: "personas",
          document: userAddress, // Correct key is "document"
          data: JSON.stringify(updatedPersona),
        },
      };
      // --- END OF FIX ---

      await signingClient!.execute(
        userAddress,
        DOCUSTORE_ADDRESS,
        writeMsg,
        "auto"
      );

      Alert.alert("Success!", "Your Persona has been updated on-chain.");
      onVerificationComplete();
    } catch (error: any) {
      console.error("Error during updateDocuStore:", error);
      Alert.alert(
        "Blockchain Error",
        error.message || "Failed to update your persona."
      );
    } finally {
      setStatus("idle");
    }
  };

  const getButtonTitle = () => {
    if (status === "verifying") return "Follow instructions...";
    if (status === "updating") return "Saving to Blockchain...";

    // THIS IS THE NEW LOGIC
    // Check if the persona object exists and has a key for the current provider
    const isAlreadyVerified = persona && persona[provider.key];

    return isAlreadyVerified
      ? `Reverify ${provider.name}`
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
