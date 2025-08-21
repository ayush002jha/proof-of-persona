// app/(tabs)/rewards.tsx
import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { RewardCard } from "../../components/RewardCard"; // Import the new card
import { usePersona } from "@/hooks/PersonaContext";
export default function RewardsScreen() {
  const { persona, loading } = usePersona();
  const userScore = persona?.personaScore?.score || 0;

  // Updated dummy data to include image URLs
  const dummyRewards = [
    {
      title: "Guaranteed Airdrop Slot",
      description:
        "Secure a guaranteed spot in the next major partner airdrop. Your high reputation means you're a valued community member.",
      requiredScore: 60,
      imageUrl:
        "https://images.unsplash.com/photo-1642239817310-e87f49fbb561?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Abstract image representing airdrops/gifts
    },
    {
      title: "VIP Alpha Group",
      description:
        "Get access to a private, token-gated chat with top analysts and builders in the ecosystem. Discuss trends before they go mainstream.",
      requiredScore: 85,
      imageUrl:
        "https://images.unsplash.com/photo-1605564538285-b045ecdf46b3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Abstract image representing data/alpha
    },
    {
      title: "Early Contributor Access",
      description:
        "Join the private Discord for our next project and get an 'Early Contributor' role before it's announced to the public.",
      requiredScore: 50,
      imageUrl: "https://images.unsplash.com/photo-1614680376739-414d95ff43df?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Abstract image representing community/contribution
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* <Text style={styles.headerTitle}>Exclusive Rewards</Text> */}

        {dummyRewards.map((reward) => (
          <RewardCard key={reward.title} {...reward} userScore={userScore} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" }, // A light gray background
  scrollContainer: { padding: 20, paddingTop: 10, paddingBottom: 120 }, // Added paddingBottom
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#1f2937",
  },
});
