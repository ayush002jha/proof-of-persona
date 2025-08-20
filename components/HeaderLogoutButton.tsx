// components/HeaderLogoutButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion-react-native";

export const HeaderLogoutButton = () => {
  const { logout } = useAbstraxionAccount();

  return (
    <TouchableOpacity onPress={() => logout()} style={styles.button}>
      <Text style={styles.buttonText}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 15,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
