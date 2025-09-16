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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion-react-native";

interface RewardCardProps {
  reward: {
    // 1. Pass the entire reward object as a single prop
    id: string;
    title: string;
    description: string;
    requiredScore: number;
    imageUrl: string;
    value: string;
    price: string;
    creatorAddress: string;
    paidUsers?: string[]; // The array of paid users is optional
  };
  userScore: number;
  isOwner: boolean;
  onDelete?: () => void;
  onSuccess: () => void; // Add a success callback for payments
}

const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  userScore,
  isOwner,
  onDelete,
  onSuccess,
}) => {
  const { data: account } = useAbstraxionAccount();
  const { client: signingClient } = useAbstraxionSigningClient();
  const [isPaying, setIsPaying] = useState(false);
  // --- NEW CHECK ---
  const hasPaid =
    isOwner ||
    (reward.paidUsers &&
      reward.paidUsers.includes(account?.bech32Address || ""));
  const isEligible = userScore >= reward.requiredScore || hasPaid;

  const handleAccess = () => {
    if (isEligible) {
      Alert.alert(
        "Access Granted!",
        `Here is your exclusive reward: ${reward.value}`
      );
    } else {
      Alert.alert(
        "Access Denied",
        `You need a Persona Score of ${reward.requiredScore} to access this reward.`
      );
    }
  };

  const handlePayment = async () => {
    if (!signingClient || !account)
      return Alert.alert("Error", "Please log in to pay.");

    setIsPaying(true);
    try {
      // --- TRANSACTION 1: SEND PAYMENT TO CREATOR ---
      const amountInUxion = (parseFloat(reward.price) * 1000000).toString();
      const paymentResult = await signingClient.sendTokens(
        account.bech32Address,
        reward.creatorAddress,
        [{ denom: "uxion", amount: amountInUxion }],
        "auto"
      );

      if (paymentResult.code !== 0) {
        throw new Error(`Payment transaction failed: ${paymentResult.rawLog}`);
      }

      console.log("Payment successful, now updating paid users list...");

      // --- TRANSACTION 2: ADD BUYER TO THE PAID USERS LIST ---
      // Create the updated data object
      const updatedRewardData = {
        ...reward, // a prop containing all the current reward data
        // Add the new user's address to the existing array
        paidUsers: [...(reward.paidUsers || []), account.bech32Address],
      };

      // Create the update message
      const updateMsg = {
        Update: {
          collection: "rewards",
          document: reward.id,
          data: JSON.stringify(updatedRewardData),
        },
      };

      // Execute the update, signed by the BUYER.
      // This will succeed because the collection permission for "update" is "Anyone".
      const updateResult = await signingClient.execute(
        account.bech32Address,
        DOCUSTORE_ADDRESS,
        updateMsg,
        "auto"
      );
      console.log("Update result:", updateResult);

      if (updateResult && updateResult.transactionHash) {
        Alert.alert(
          "Payment Successful!",
          `Access Granted! Reward: ${reward.value}`
        );
        onSuccess(); // Trigger a refresh of the UI
      } else {
        // This case handles any unexpected response structure.
        throw new Error("Failed to confirm the access list update on-chain.");
      }
    } catch (error: any) {
      Alert.alert("An Error Occurred", error.message);
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
        <Image source={{ uri: reward.imageUrl }} className="w-full h-40" />
        <View className="absolute top-3 right-3 bg-[#FFD700]/90 px-3 py-1 rounded-full">
          <Text className="text-black text-xs font-bold">
            Requires Score {reward.requiredScore}+
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View className="p-5">
        <Text className="text-xl font-bold text-gray-800 mb-2">
          {reward.title}
        </Text>
        <Text className="text-base text-gray-600 mb-5">
          {reward.description}
        </Text>

        {/* --- THIS IS THE CORRECTED LOGIC --- */}
        {isOwner ? (
          // If the user is the owner, show a Delete button
          <TouchableOpacity
            className="py-3 rounded-full items-center bg-red-500 w-1/2 ms-auto"
            onPress={onDelete} // The onPress calls the onDelete function
          >
            <View className="flex-row items-center">
              <Ionicons name="trash-bin-outline" size={20} color="white" />
              <Text className="font-bold text-base text-white ml-2">
                Delete
              </Text>
            </View>
          </TouchableOpacity>
        ) : isEligible ? (
          // Otherwise, show the normal Access button
          <TouchableOpacity
            className={`flex-row justify-center w-1/2 ms-auto py-3 rounded-full items-center bg-blue-500`}
            onPress={handleAccess}
          >
            {hasPaid&&<MaterialIcons name="paid" size={24} color="#FFD700" className="pe-2"/>}
            <Text
              className={`font-bold text-base ${isEligible ? "text-white" : "text-gray-500"}`}
            >
              Access Now
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="white"
              className=""
            />
          </TouchableOpacity>
        ) : (
          // User is NOT eligible by score, show the payment button
          <TouchableOpacity
            className={`py-3 rounded-full w-1/2 ms-auto items-center justify-center flex-row ${isPaying ? "bg-green-300" : "bg-green-500"}`}
            onPress={handlePayment}
            disabled={isPaying}
          >
            {isPaying ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="white"
                  className="mr-2"
                />
                <Text className="font-bold text-base text-white">
                  Pay {reward.price} $XION
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
        {/* --- END OF CORRECTION --- */}
      </View>
    </View>
  );
};
