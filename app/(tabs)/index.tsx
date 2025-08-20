// app/(tabs)/index.tsx
import React, { useState, useCallback } from "react";
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  RefreshControl,
} from "react-native";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion-react-native";
import { PersonaDashboard } from "../../components/PersonaDashboard";
import { usePersona } from "@/hooks/PersonaContext"; // Adjust the import path as necessary
import { Pressable } from "react-native-gesture-handler";
export default function DashboardScreen() {
  const { data: account, logout } = useAbstraxionAccount();
  // Get the fetchPersona function from our context
  const { fetchPersona } = usePersona();
  const [refreshing, setRefreshing] = useState(false);

  // This is the function that will be called when the user pulls down
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPersona(); // Call the fetch function from our context
    setRefreshing(false);
  }, [fetchPersona]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* The ScrollView now has the RefreshControl */}
      <ScrollView
        className="flex-1"
        // CRITICAL: Add bottom padding to prevent content from hiding behind the tab bar
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-5 items-center w-full">
          <View className="w-full flex-row justify-between items-center mb-2">
            {/* <Text className="text-3xl font-bold">My Dashboard</Text> */}
            {/* We use a custom styled button for logout now */}
            <Pressable
              onPress={() => logout()}
              className="bg-red-500 px-4 py-2 rounded-full"
            >
              <Text className="text-white font-bold">Logout</Text>
            </Pressable>
          </View>
          <Text
            className="text-sm text-gray-500 break-all text-center mb-4"
            selectable
          >
            {account?.bech32Address}
          </Text>

          <PersonaDashboard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
