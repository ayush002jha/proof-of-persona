// app/(tabs)/my-rewards.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useAbstraxionClient, useAbstraxionAccount, useAbstraxionSigningClient } from '@burnt-labs/abstraxion-react-native';
import { useFocusEffect } from 'expo-router';
import { RewardCard } from '@/components/RewardCard';
import { usePersona } from '@/hooks/PersonaContext';

const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;

export default function MyRewardsScreen() {
    const { client: queryClient } = useAbstraxionClient();
    const { data: account } = useAbstraxionAccount();
    const { client: signingClient } = useAbstraxionSigningClient();
    const { persona } = usePersona();
    const [myRewards, setMyRewards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const userScore = persona?.personaScore?.score || 0;

    const fetchMyRewards = useCallback(async () => {
        if (!queryClient || !account?.bech32Address) {
            console.log("Fetch prerequisites not met.");
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        console.log(`Fetching rewards for owner: ${account.bech32Address}`);

        try {
            const queryMsg = { UserDocuments: { owner: account.bech32Address, collection: "rewards" } };
            const response = await queryClient.queryContractSmart(DOCUSTORE_ADDRESS, queryMsg);
            
            console.log("Raw response from DocuStore:", JSON.stringify(response, null, 2));

            // --- THIS IS THE FINAL, CORRECTED LOGIC ---
            // Access `response.documents` directly, NOT `response.data.documents`
            if (response && response.documents && response.documents.length > 0) {
                const fetchedRewards = response.documents.map((doc: [string, any]) => ({ 
                    id: doc[0], 
                    // The actual reward data is nested in a 'data' property inside the document
                    ...JSON.parse(doc[1].data) 
                }));
                console.log("Successfully parsed rewards:", fetchedRewards);
                setMyRewards(fetchedRewards);
            } else {
                console.log("No documents found in the response for this user.");
                setMyRewards([]);
            }
            // --- END OF FIX ---

        } catch (error) {
            console.error("Error fetching my rewards:", error);
            setMyRewards([]); 
        } finally {
            console.log("Finished fetching. Setting loading to false.");
            setIsLoading(false);
        }
    }, [queryClient, account?.bech32Address]);

    useFocusEffect(useCallback(() => { fetchMyRewards(); }, [fetchMyRewards]));

    const handleDelete = async (rewardId: string) => {
        if (!signingClient || !account) return;
        Alert.alert("Confirm Deletion", "This action is permanent.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive",
                onPress: async () => {
                    try {
                        const deleteMsg = { Delete: { collection: "rewards", document: rewardId } };
                        await signingClient.execute(account.bech32Address, DOCUSTORE_ADDRESS, deleteMsg, "auto");
                        Alert.alert("Success", "Reward deleted.");
                        fetchMyRewards();
                    } catch (e: any) { Alert.alert("Error", e.message); }
                }
            }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchMyRewards} />}>
                {/* <Text className="text-3xl font-bold mb-6">My Created Rewards</Text> */}
                {isLoading ? <ActivityIndicator size="large" /> : myRewards.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">You haven't created any rewards yet.</Text>
                ) : (
                    myRewards.map((reward) => (
                        <RewardCard 
                            key={reward.id} 
                            {...reward} 
                            userScore={userScore}
                            isOwner={true}
                            onDelete={() => handleDelete(reward.id)}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}