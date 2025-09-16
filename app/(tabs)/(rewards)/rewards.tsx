// app/(tabs)/rewards.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  useAbstraxionClient,
  useAbstraxionAccount,
} from "@burnt-labs/abstraxion-react-native";
import { useFocusEffect } from "expo-router";
import { RewardCard } from "@/components/RewardCard";
import { usePersona } from "@/hooks/PersonaContext";

const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;

export default function RewardsScreen() {
  const { persona } = usePersona();
  const { client: queryClient } = useAbstraxionClient();
  const { data: account } = useAbstraxionAccount();
  const [rewards, setRewards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userScore = persona?.personaScore?.score || 0;

  const fetchAllRewards = useCallback(async () => {
    if (!queryClient) return;
    setIsLoading(true);
    try {
      const queryMsg = { Collection: { collection: "rewards" } };
      const response = await queryClient.queryContractSmart(
        DOCUSTORE_ADDRESS,
        queryMsg
      );

      // --- THIS IS THE FINAL, CORRECTED PARSING LOGIC ---
      // The Abstraxion SDK client returns the `documents` array at the top level.
      if (response && response.documents) {
        // Filter out the persona details document (whose key is the user's address, not a timestamp)
        const allRewards = response.documents
          .filter((doc: [string, any]) => !isNaN(Number(doc[0])))
          .map((doc: [string, any]) => ({
            id: doc[0],
            ...JSON.parse(doc[1].data),
          }));
        console.log("Total rewards fetched:", allRewards.length);
        const otherUsersRewards = allRewards.filter(
          (r: any) => r.creatorAddress !== account?.bech32Address
        );
        console.log(
          "No. of rewards after filtering:",
          otherUsersRewards.length
        );
        setRewards(
          otherUsersRewards.sort(
            (a: any, b: any) => b.requiredScore - a.requiredScore
          )
        );
      } else {
        console.log("No documents found in the response.");
        setRewards([]);
      }
      // --- END OF FIX ---
    } catch (error) {
      setRewards([]);
      console.error("Failed to fetch public rewards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, account?.bech32Address]);

  useFocusEffect(
    useCallback(() => {
      fetchAllRewards();
    }, [fetchAllRewards])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchAllRewards} />
        }
      >
        {/* <Text className="text-3xl font-bold mb-6 text-gray-800">
          Community Rewards
        </Text> */}
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : rewards.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">
            No rewards created by the community yet.
          </Text>
        ) : (
          rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward} // Pass the entire object
              userScore={userScore}
              isOwner={false}
              onSuccess={fetchAllRewards} // Refresh the list on success
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
