// components/PersonaDashboard.tsx
import React, { useCallback, useState } from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';
import { useAbstraxionAccount, useAbstraxionClient } from '@burnt-labs/abstraxion-react-native';
import { useFocusEffect } from 'expo-router';

const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;

export const PersonaDashboard = () => {
    const { data: account } = useAbstraxionAccount();
    const { client: queryClient } = useAbstraxionClient();
    const [persona, setPersona] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchPersona = useCallback(async () => {
        if (!queryClient || !account?.bech32Address) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await queryClient.queryContractSmart(DOCUSTORE_ADDRESS, {
                read: { collection: "personas", document_id: account.bech32Address },
            });
            setPersona(res.data ? JSON.parse(res.data) : null);
        } catch (error) {
            setPersona(null); // Set to null if no persona is found
        } finally {
            setLoading(false);
        }
    }, [queryClient, account?.bech32Address]);

    // useFocusEffect will refetch data whenever the screen comes into view
    useFocusEffect(
        useCallback(() => {
            fetchPersona();
        }, [fetchPersona])
    );

    if (loading) {
        return <ActivityIndicator size="large" className="my-8" />;
    }

    return (
        <View className="p-4 my-4 bg-gray-100 rounded-lg border border-gray-200 w-full">
            <Text className="text-xl font-bold mb-2">My On-Chain Persona</Text>
            {!persona ? (
                <Text>No verified credentials yet. Go to the "Verify" tab to add some!</Text>
            ) : (
                <View>
                    {persona.twitter && (
                        <Text className="text-base">- Verified Twitter Followers: {persona.twitter.followers}</Text>
                    )}
                    {persona.github && (
                        <Text className="text-base">- Verified GitHub Contributions: {persona.github.contributions}</Text>
                    )}
                    <Text className="text-xs text-gray-500 mt-2">Last Updated: {new Date(persona.lastUpdatedAt).toLocaleString()}</Text>
                </View>
            )}
            <View className="mt-4">
               <Button title="Refresh" onPress={fetchPersona} />
            </View>
        </View>
    );
};