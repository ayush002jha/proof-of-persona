// app/(tabs)/index.tsx
import React from 'react';
import { View, Text, Button, SafeAreaView } from 'react-native';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion-react-native';
import { PersonaDashboard } from '../../components/PersonaDashboard';

export default function DashboardScreen() {
    const { data: account, login, isConnected, isConnecting } = useAbstraxionAccount();

    if (!isConnected) {
        return (
            <View className="flex-1 justify-center items-center bg-white p-5">
                <Text className="text-3xl font-bold mb-2 text-center">Welcome to</Text>
                <Text className="text-4xl font-extrabold mb-8 text-center text-blue-600">Proof of Persona</Text>
                <View className="w-64">
                    <Button title={isConnecting ? "Connecting..." : "Login / Sign Up"} onPress={() => login()} disabled={isConnecting} />
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-5 items-center">
                <Text className="text-3xl font-bold mt-8">My Dashboard</Text>
                <Text className="text-sm text-gray-500 break-all text-center mt-1" selectable>{account?.bech32Address}</Text>
                <PersonaDashboard />
            </View>
        </SafeAreaView>
    );
}