// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { PersonaProvider } from "@/hooks/PersonaContext";

export default function TabLayout() {
  return (
    <PersonaProvider>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: "#007AFF",
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-circle" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="verify"
          options={{
            title: "Verify",
            tabBarIcon: ({ color }) => (
              <Ionicons name="shield-checkmark" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="rewards" options={{ title: "Rewards" }} />
      </Tabs>
    </PersonaProvider>
  );
}
