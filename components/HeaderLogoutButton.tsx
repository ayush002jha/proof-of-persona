// components/HeaderLogoutButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion-react-native";
import { LinearGradient } from "expo-linear-gradient";

export const HeaderLogoutButton = () => {
  const { logout } = useAbstraxionAccount();

  return (
    <TouchableOpacity onPress={() => logout()} className="mr-3">
      <LinearGradient
        colors={["#3b82f6", "#2563eb", "#1d4ed8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 9999,
          shadowColor: "#3b82f6",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({

  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
