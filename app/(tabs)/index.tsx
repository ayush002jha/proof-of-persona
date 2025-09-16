// app/(tabs)/index.tsx
import React, { useState, useCallback } from "react";
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion-react-native";
import { PersonaDashboard } from "../../components/PersonaDashboard";
import { usePersona } from "@/hooks/PersonaContext"; // Adjust the import path as necessary
import { LinearGradient } from "expo-linear-gradient";

export default function DashboardScreen() {
  const { data: account, logout } = useAbstraxionAccount();
  // Get the fetchPersona function from our context
  const { fetchPersona } = usePersona();
  const [refreshing, setRefreshing] = useState(false);
  const { balance } = usePersona(); // Get the balance from our context

  // Helper function to format the balance from uxion to XION
  const formatBalance = (uxion: string) => {
    const amount = parseFloat(uxion) / 1000000;
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  // This is the function that will be called when the user pulls down
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPersona(); // Call the fetch function from our context
    setRefreshing(false);
  }, [fetchPersona]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100  ">
      {/* The ScrollView now has the RefreshControl */}
      <ScrollView
        className="flex-1 p-4"
        // CRITICAL: Add bottom padding to prevent content from hiding behind the tab bar
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        stickyHeaderIndices={[0]}
      >
        {/* Main Card Container with Enhanced Design */}
        <View className="w-full p-4  relative overflow-hidden bg-white/70 backdrop-blur-sm border-[0.3px] rounded-3xl mb-6 shadow-lg shadow-gray-900/10">
          {/* Balance Section */}
          <View className="mb-3">
            <Text className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Portfolio Balance
            </Text>
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-3xl font-black text-gray-900 tracking-tight">
                  {formatBalance(balance)}
                </Text>
                <Text className="text-sm font-semibold text-gray-500 mt-1">
                  $XION
                </Text>
              </View>

              {/* Enhanced Buy Button */}
              <TouchableOpacity
                className="relative overflow-hidden rounded-full"
                onPress={() =>
                  Alert.alert(
                    "Coming Soon!",
                    "A fiat on-ramp will be integrated here to let you buy XION with your credit card."
                  )
                }
              >
                <LinearGradient
                  colors={["#10b981", "#059669", "#047857"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="px-6 py-3 rounded-full shadow-lg shadow-green-500/25"
                >
                  <Text className="text-white font-bold text-lg">Buy XION</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Wallet Address Section */}
          <View className="space-y-3">
            <Text className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Wallet Address
            </Text>

            {/* Address Container with Enhanced Design */}
            <View className="relative">
              <View className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl" />
              <View className="relative bg-gray-200/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50">
                <Text
                  className="text-sm font-mono text-gray-700 leading-relaxed"
                  selectable
                >
                  {account?.bech32Address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <PersonaDashboard />
      </ScrollView>
    </SafeAreaView>
  );
}
