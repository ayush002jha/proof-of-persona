// components/ScoreBreakdownRow.tsx
import React from 'react';
import { View, Text } from 'react-native';
import * as Progress from 'react-native-progress';
import { Ionicons } from '@expo/vector-icons'; // Make sure you have this installed

interface ScoreBreakdownRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  score: number;
  color: string;
}

export const ScoreBreakdownRow: React.FC<ScoreBreakdownRowProps> = ({ iconName, label, score, color }) => {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3">
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: color }}>
          <Ionicons name={iconName} size={24} color="white" />
        </View>
        <Text className="flex-1 text-base font-semibold text-gray-700">{label}</Text>
        <Text className="text-lg font-bold text-gray-800">{score}</Text>
      </View>
      <Progress.Bar
        progress={score / 100}
        width={null} // null makes it take up the full width
        height={6}
        color={color}
        unfilledColor="#e0e7ff"
        borderWidth={0}
        borderRadius={5}
      />
    </View>
  );
};