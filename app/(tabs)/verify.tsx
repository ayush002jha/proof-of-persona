// app/(tabs)/verify.tsx
import React from 'react';
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { PERSONA_PROVIDERS } from '../../constants/providers';
import { ReclaimVerifyButton } from '../../components/ReclaimVerifyButton';
import { router } from 'expo-router';

export default function VerifyScreen() {
    const handleSuccess = () => {
        // After success, navigate back to the dashboard. The useFocusEffect will handle the refresh.
        router.replace('/'); 
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-5">
                <Text className="text-3xl font-bold mt-8 mb-4">Add Verifications</Text>
                <Text className="text-base text-gray-600 mb-6">Select a provider to add a new verifiable credential to your on-chain persona.</Text>
                <FlatList
                    data={PERSONA_PROVIDERS}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ReclaimVerifyButton provider={item} onVerificationComplete={handleSuccess} />
                    )}
                />
            </View>
        </SafeAreaView>
    );
}