// app/(tabs)/rewards.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, ActivityIndicator, Modal, TouchableOpacity, RefreshControl } from 'react-native';
import { usePersona } from '@/hooks/PersonaContext';
import { useAbstraxionClient } from '@burnt-labs/abstraxion-react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RewardCard } from '../../components/RewardCard'; // Your existing card is perfect
import { CreateRewardModal } from '../../components/CreateRewardModal'; // Import the new modal

const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;
const SCORE_TO_CREATE_REWARD = 60; // Set the score threshold

export default function RewardsScreen() {
    const { persona } = usePersona();
    const { client: queryClient } = useAbstraxionClient();
    const [rewards, setRewards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const userScore = persona?.personaScore?.score || 0;

    const fetchRewards = useCallback(async () => {
        if (!queryClient) return;
        setIsLoading(true);
        try {
            const queryMsg = { Collection: { name: "rewards" } }; // Query the "rewards" collection
            const response = await queryClient.queryContractSmart(DOCUSTORE_ADDRESS, queryMsg);
            if (response && response.documents) {
                const fetchedRewards = response.documents.map((doc: [string, any]) => JSON.parse(doc[1].data));
                setRewards(fetchedRewards.sort((a:any, b:any) => b.requiredScore - a.requiredScore));
            }
        } catch (error) { console.log("Failed to fetch rewards:", error); }
        finally { setIsLoading(false); }
    }, [queryClient]);

    useFocusEffect(useCallback(() => { fetchRewards(); }, [fetchRewards]));

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchRewards();
        setRefreshing(false);
    }, [fetchRewards]);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >                
                {isLoading ? <ActivityIndicator size="large" /> : rewards.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">No community rewards created yet. Be the first!</Text>
                ) : (
                    rewards.map((reward, index) => (
                        <RewardCard key={index} {...reward} userScore={userScore} />
                    ))
                )}
            </ScrollView>

            {userScore >= SCORE_TO_CREATE_REWARD && (
                <TouchableOpacity
                    className="absolute bottom-28 right-5 w-16 h-16 rounded-full bg-blue-500 justify-center items-center shadow-lg"
                    onPress={() => setIsModalVisible(true)}
                >
                    <Ionicons name="add" size={32} color="white" />
                </TouchableOpacity>
            )}

            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <TouchableOpacity 
                    className="flex-1 bg-black/40 justify-end" 
                    activeOpacity={1} 
                    onPressOut={() => setIsModalVisible(false)}
                >
                    <CreateRewardModal onClose={() => {
                        setIsModalVisible(false);
                        fetchRewards();
                    }} />
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}