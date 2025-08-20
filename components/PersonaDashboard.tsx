// components/PersonaDashboard.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  StyleSheet,
} from "react-native";

import { router } from "expo-router";
import { usePersona } from "@/hooks/usePersona";

const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;

export const PersonaDashboard = () => {
  const { persona, loading, error, fetchPersona } = usePersona();

  if (loading) {
    return <ActivityIndicator size="large" style={styles.container} />;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My On-Chain Persona</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {!persona || !persona.personaScore ? (
        <View style={styles.centerContent}>
          <Text style={styles.text}>No verified credentials found.</Text>
          <Button title="Go Verify!" onPress={() => router.push("/verify")} />
        </View>
      ) : (
        <View className="w-full">
          <Text className="text-6xl font-bold text-center text-blue-600">
            {persona.personaScore.score}
          </Text>
          <Text className="text-center text-gray-600 mb-4">
            {persona.personaScore.explanation}
          </Text>

          {/* --- THIS IS THE UPDATED SECTION --- */}
          {persona.verifications.twitter && (
            <Text style={styles.text}>
              ✅ Twitter Verified ({persona.verifications.twitter.followers}{" "}
              followers)
            </Text>
          )}
          {persona.verifications.github && (
            <Text style={styles.text}>
              ✅ GitHub Verified (
              {persona.verifications.github.contributionsLastYear}{" "}
              contributions)
            </Text>
          )}
          {persona.verifications.binance && (
            <Text style={styles.text}>
              ✅ Binance KYC Status: {persona.verifications.binance.kycStatus}
            </Text>
          )}
          {persona.verifications.linkedin && (
            <Text style={styles.text}>
              ✅ LinkedIn Verified ({persona.verifications.linkedin.connections}{" "}
              connections)
            </Text>
          )}
          {persona.verifications.twitterTweets && (
            <Text style={styles.text}>✅ Twitter Activity Verified</Text>
          )}
          {/* --- END OF UPDATED SECTION --- */}

          <Text style={styles.timestamp}>
            Last Updated: {new Date(persona.lastUpdatedAt).toLocaleString()}
          </Text>
        </View>
      )}
      <View style={{ marginTop: 16 }}>
        <Button title="Refresh" onPress={fetchPersona} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 16,
    backgroundColor: "#f0f2f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: "100%",
  },
  centerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 14,
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
});
