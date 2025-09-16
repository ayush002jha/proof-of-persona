// components/RewardCard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion-react-native";

interface RewardCardProps {
  title: string;
  description: string;
  requiredScore: number;
  userScore: number;
  imageUrl: string;
  value: string;
  isOwner: boolean; // Is the current user the creator?
  onDelete?: () => void; // Optional function to handle deletion
  price: string;
  creatorAddress: string;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  title,
  description,
  requiredScore,
  userScore,
  imageUrl,
  value,
  isOwner,
  onDelete,
  price,
  creatorAddress,
}) => {
  const { data: account } = useAbstraxionAccount();
  const { client: signingClient } = useAbstraxionSigningClient();
  const [isPaying, setIsPaying] = useState(false);
  const isEligible = userScore >= requiredScore;

  const handleAccess = () => {
    if (isEligible) {
      Alert.alert("Access Granted!", `Here is your exclusive reward: ${value}`);
    } else {
      Alert.alert(
        "Access Denied",
        `You need a Persona Score of ${requiredScore} to access this reward.`
      );
    }
  };

  const handlePayment = async () => {
    if (!signingClient || !account)
      return Alert.alert("Error", "Please log in to pay.");
    if (!price || !creatorAddress)
      return Alert.alert("Error", "Reward is not configured for payment.");

    setIsPaying(true);
    try {
      // The blockchain requires amounts in the smallest denomination (uxion)
      // 1 XION = 1,000,000 uxion
      const amountInUxion = (parseFloat(price) * 1000000).toString();

      // Use the Abstraxion SDK's built-in helper for sending tokens
      const result = await signingClient.sendTokens(
        account.bech32Address,
        creatorAddress,
        [{ denom: "uxion", amount: amountInUxion }],
        "auto" // Automatically calculate the fee (gasless for the user)
      );

      // A successful transaction returns a code of 0
      if (result.code === 0) {
        Alert.alert(
          "Payment Successful!",
          `Access Granted! Here is your reward: ${value}`
        );
      } else {
        throw new Error(result.rawLog || "Transaction failed on-chain.");
      }
    } catch (error: any) {
      Alert.alert("Payment Failed", error.message);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <View
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden `}
    >
      {/* Image Section - This part remains the same */}
      <View className="relative">
        <Image source={{ uri: imageUrl }} className="w-full h-40" />
        <View className="absolute top-3 right-3 bg-blue-500/90 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">
            Requires Score {requiredScore}+
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View className="p-5">
        <Text className="text-xl font-bold text-gray-800 mb-2">{title}</Text>
        <Text className="text-base text-gray-600 mb-5">{description}</Text>

        {/* --- THIS IS THE CORRECTED LOGIC --- */}
        {isOwner ? (
          // If the user is the owner, show a Delete button
          <TouchableOpacity
            className="py-3 rounded-lg items-center bg-red-500"
            onPress={onDelete} // The onPress calls the onDelete function
          >
            <View className="flex-row items-center">
              <Ionicons name="trash-bin-outline" size={20} color="white" />
              <Text className="font-bold text-base text-white ml-2">
                Delete My Reward
              </Text>
            </View>
          </TouchableOpacity>
        ) : isEligible ? (
          // Otherwise, show the normal Access button
          <TouchableOpacity
            className={`py-3 rounded-lg items-center ${isEligible ? "bg-blue-500" : "bg-gray-300"}`}
            onPress={handleAccess}
          >
            <Text
              className={`font-bold text-base ${isEligible ? "text-white" : "text-gray-500"}`}
            >
              Access Now (with score)
            </Text>
          </TouchableOpacity>
        ) : (
          // User is NOT eligible by score, show the payment button
          <TouchableOpacity
            className={`py-3 rounded-lg items-center ${isPaying ? "bg-green-300" : "bg-green-500"}`}
            onPress={handlePayment}
            disabled={isPaying}
          >
            {isPaying ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-bold text-base text-white">
                Pay {price} $XION to Access
              </Text>
            )}
          </TouchableOpacity>
        )}
        {/* --- END OF CORRECTION --- */}
      </View>
    </View>
  );
};
