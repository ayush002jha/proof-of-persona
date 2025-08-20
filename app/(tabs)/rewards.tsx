// app/(tabs)/rewards.tsx
import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Button,
  Alert,
} from "react-native";
import { usePersona } from "@/hooks/PersonaContext";
interface RewardCardProps {
  title: string;
  description: string;
  requiredScore: number;
  userScore: number;
}

const RewardCard: React.FC<RewardCardProps> = ({
  title,
  description,
  requiredScore,
  userScore,
}) => {
  const isEligible = userScore >= requiredScore;

  const handleClaim = () => {
    if (isEligible) {
      Alert.alert(
        "Success!",
        `You have successfully claimed the "${title}" reward.`
      );
    } else {
      Alert.alert(
        "Ineligible",
        `You need a Persona Score of ${requiredScore} to claim this reward.`
      );
    }
  };

  return (
    <View style={[styles.card, !isEligible && styles.disabledCard]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      <View style={styles.eligibilityContainer}>
        <Text style={isEligible ? styles.eligibleText : styles.ineligibleText}>
          {isEligible ? "✅ Eligible" : `❌ Requires Score: ${requiredScore}`}
        </Text>
        <Text>Your Score: {userScore}</Text>
      </View>
      <Button
        title={isEligible ? "Claim Reward" : "Not Eligible"}
        onPress={handleClaim}
        disabled={!isEligible}
      />
    </View>
  );
};

export default function RewardsScreen() {
  const { persona, loading } = usePersona();
  const userScore = persona?.personaScore?.score || 0;

  const dummyRewards = [
    {
      title: "Exclusive Community Chat",
      description: "Join a private chat with other high-reputation members.",
      requiredScore: 50,
    },
    {
      title: "Early Access Pass",
      description: "Get early access to the next big feature.",
      requiredScore: 75,
    },
    {
      title: "Airdrop Multiplier",
      description: "Receive a 2x multiplier on the next partner airdrop.",
      requiredScore: 90,
    },
  ];

  if (loading) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Exclusive Rewards</Text>
        <Text style={styles.subHeader}>
          Improve your Persona Score by adding more verifications to unlock new
          opportunities.
        </Text>
        {dummyRewards.map((reward) => (
          <RewardCard key={reward.title} {...reward} userScore={userScore} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 32, fontWeight: "bold", marginBottom: 8 },
  subHeader: { fontSize: 16, color: "#666", marginBottom: 24 },
  card: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  disabledCard: {
    backgroundColor: "#e9ecef",
    opacity: 0.7,
  },
  cardTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  cardDescription: { fontSize: 14, color: "#495057", marginBottom: 16 },
  eligibilityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    padding: 1,
  },
  eligibleText: {
    color: "#28a745",
    fontWeight: "bold",
  },
  ineligibleText: {
    color: "#dc3545",
    fontWeight: "bold",
  },
});
