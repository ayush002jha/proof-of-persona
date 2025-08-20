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

      {!persona ? (
        <View style={styles.centerContent}>
          <Text style={styles.text}>No verified credentials found.</Text>
          <Button title="Go Verify!" onPress={() => router.push("/verify")} />
        </View>
      ) : (
        <View>
          {persona.twitter && (
            <Text style={styles.text}>
              - Verified Twitter Followers: {persona.twitter.followers}
            </Text>
          )}
          {persona.github && (
            <Text style={styles.text}>
              - Verified GitHub Contributions: {persona.github.contributions}
            </Text>
          )}
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
