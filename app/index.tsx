// app/index.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login, isConnected, isConnecting } = useAbstraxionAccount();

  // This effect hook handles automatic navigation
  useEffect(() => {
    // If the user is connected, immediately replace the login screen with the dashboard
    if (isConnected) {
      router.replace('/(tabs)'); // Navigate to the main tab layout
    }
  }, [isConnected]); // This runs whenever the `isConnected` state changes

  return (
    <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
      <View className="bg-white p-8 rounded-2xl shadow-lg w-11/12 max-w-sm items-center">
        {/* You can replace this with your actual logo asset */}
        <Image 
          source={{ uri: 'https://i.imgur.com/your-logo.png' }} // Placeholder Icon
          className="w-20 h-20 mb-6" 
        />
        
        <Text className="text-3xl font-bold text-gray-800">
          Proof of Persona
        </Text>
        <Text className="text-base text-gray-500 mt-2 text-center mb-8">
          Build your Persona Score from Web2 activities and unlock exclusive opportunities.
        </Text>

        {isConnecting ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : (
          <TouchableOpacity
            className="bg-blue-500 w-full py-4 rounded-lg shadow"
            onPress={() => login()}
            disabled={isConnecting}
          >
            <Text className="text-white text-center font-bold text-lg">
              Connect Wallet
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}