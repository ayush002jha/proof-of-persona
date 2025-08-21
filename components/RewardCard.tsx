// components/RewardCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';

interface RewardCardProps {
  title: string;
  description: string;
  requiredScore: number;
  userScore: number;
  imageUrl: string; // Add an image URL prop
}

export const RewardCard: React.FC<RewardCardProps> = ({ title, description, requiredScore, userScore, imageUrl }) => {
  const isEligible = userScore >= requiredScore;

  const handleAccess = () => {
    if (isEligible) {
      Alert.alert("Access Granted!", `You can now access the "${title}" reward.`);
    } else {
      Alert.alert("Access Denied", `You need a Persona Score of ${requiredScore} to access this reward.`);
    }
  };

  return (
    <View className={`bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden ${!isEligible ? 'opacity-60' : ''}`}>
      {/* Image Section */}
      <View className="relative">
        <Image source={{ uri: imageUrl }} className="w-full h-40" />
        <View className="absolute top-3 right-3 bg-blue-500/90 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">Requires Score {requiredScore}+</Text>
        </View>
      </View>
      
      {/* Content Section */}
      <View className="p-5">
        <Text className="text-xl font-bold text-gray-800 mb-2">{title}</Text>
        <Text className="text-base text-gray-600 mb-5">{description}</Text>
        
        <TouchableOpacity
          className={`py-3 rounded-lg items-center ${isEligible ? 'bg-blue-500' : 'bg-gray-300'}`}
          onPress={handleAccess}
        >
          <Text className={`font-bold text-base ${isEligible ? 'text-white' : 'text-gray-500'}`}>
            {isEligible ? "Access Now" : `Score ${requiredScore}+ Required`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};