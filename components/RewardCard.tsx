// components/RewardCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RewardCardProps {
  title: string;
  description: string;
  requiredScore: number;
  userScore: number;
  imageUrl: string;
  value: string;
  isOwner: boolean; // Is the current user the creator?
  onDelete?: () => void; // Optional function to handle deletion
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
}) => {
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

  return (
    <View
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden ${!isEligible && !isOwner ? "opacity-60" : ""}`}
    >
      <View className="relative">
        <Image source={{ uri: imageUrl }} className="w-full h-40" />
        <View className="absolute top-3 right-3 bg-blue-500/90 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">
            Requires Score {requiredScore}+
          </Text>
        </View>
        {/* Show a delete button if the user is the owner */}
        {isOwner && onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            className="absolute top-2 left-2 p-2 bg-black/50 rounded-full"
          >
            <Ionicons name="trash-bin-outline" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <View className="p-5">
        <Text className="text-xl font-bold text-gray-800 mb-2">{title}</Text>
        <Text className="text-base text-gray-600 mb-5">{description}</Text>

        <TouchableOpacity
          className={`py-3 rounded-lg items-center ${isEligible ? "bg-blue-500" : "bg-gray-300"}`}
          onPress={handleAccess}
        >
          <Text
            className={`font-bold text-base ${isEligible ? "text-white" : "text-gray-500"}`}
          >
            {isEligible ? "Access Now" : `Score ${requiredScore}+ Required`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
