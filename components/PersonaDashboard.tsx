// components/PersonaDashboard.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  StyleSheet,
} from "react-native";
import {
  useAbstraxionAccount,
  useAbstraxionClient,
} from "@burnt-labs/abstraxion-react-native";
import { useFocusEffect, router } from "expo-router";

const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;

export const PersonaDashboard = () => {
  const { data: account } = useAbstraxionAccount();
  const { client: queryClient } = useAbstraxionClient();
  const [persona, setPersona] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPersona = useCallback(async () => {
    if (!queryClient || !account?.bech32Address) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    console.log("Dashboard: Fetching persona for", account.bech32Address);

    try {
      const queryMsg = {
        UserDocuments: {
          owner: account.bech32Address,
          collection: "personas",
        },
      };

      // This response object has the structure { documents: [...] }
      const response = await queryClient.queryContractSmart(
        DOCUSTORE_ADDRESS,
        queryMsg
      );

      console.log("Dashboard: Received raw response:", response);

      // --- THIS IS THE FINAL, CORRECTED PARSING LOGIC ---
      // Access `response.documents` directly, not `response.data.documents`
      if (response && response.documents && response.documents.length > 0) {
        const userDocTuple = response.documents.find(
          (doc: [string, any]) => doc[0] === account.bech32Address
        );

        // The persona JSON is in the nested "data" property of the document object
        if (userDocTuple && userDocTuple[1] && userDocTuple[1].data) {
          setPersona(JSON.parse(userDocTuple[1].data));
        } else {
          setPersona(null);
        }
      } else {
        setPersona(null);
      }
      // --- END OF FIX ---
    } catch (err: any) {
      console.error("Dashboard: Error fetching persona:", err);
      setError("Could not fetch persona. It might not be created yet.");
      setPersona(null);
    } finally {
      setLoading(false);
    }
  }, [queryClient, account?.bech32Address]);

  useFocusEffect(
    useCallback(() => {
      fetchPersona();
    }, [fetchPersona])
  );

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
