// components/NewUserCTA.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export const NewUserCTA = () => {
  return (
    <View className="p-6 bg-gray-50 rounded-lg items-center text-center">
        <Text className="text-xl font-bold mb-2">Welcome!</Text>
        <Text className="text-base text-gray-600 text-center mb-6">
            You don't have a Persona Score yet. Add your first verification to generate one.
        </Text>
        <Button title="Go to Verify Page" onPress={() => router.push('/verify')} />
    </View>
  );
};