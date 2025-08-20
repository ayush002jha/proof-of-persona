// app/(tabs)/index.tsx
import React from 'react';
import { View, Text, SafeAreaView, Button } from 'react-native';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion-react-native';
import { PersonaDashboard } from '../../components/PersonaDashboard'; // Assuming correct path

export default function DashboardScreen() {
    const { data: account, logout } = useAbstraxionAccount();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-5">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-3xl font-bold">My Dashboard</Text>
                    <Button title="Logout" onPress={() => logout()} />
                </View>
                <Text className="text-sm text-gray-500 break-all text-center mb-2" selectable>
                    {account?.bech32Address}
                </Text>
                <PersonaDashboard />
            </View>
        </SafeAreaView>
    );
}