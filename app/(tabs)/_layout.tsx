// app/(tabs)/_layout.tsx
import { Tabs, router } from "expo-router";
import React, {useEffect} from "react";
import { Platform , Text} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur"; // Import BlurView
import { PersonaProvider } from "@/hooks/PersonaContext";
import { HeaderLogoutButton } from "../../components/HeaderLogoutButton"; // Adjusted path
import { useAbstraxionAccount } from "@burnt-labs/abstraxion-react-native"; 

export default function TabLayout() {

  return (
    <PersonaProvider>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "#8e8e93", // A nice gray for inactive tabs

          // Header styles remain the same
          headerStyle: {
            backgroundColor: "#ffffff",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: "#f0f0f0",
          },
          headerTitleStyle: {
            fontSize: 22,
            fontWeight: "bold",
          },
          headerRight: () => <HeaderLogoutButton />,

          // --- THIS IS THE NEW SECTION FOR THE FLOATING BLUR TAB BAR ---
          tabBarStyle: {
            position: "absolute", // This makes the tab bar float
            bottom: Platform.OS === "ios" ? 30 : 20, // Adjust vertical position
            left: 20,
            right: 20,

            // Style the container
            borderRadius: 25,
            height: 60,
            width: "90%",
            backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent white background
            borderTopWidth: 0, // Remove the default top border
            marginHorizontal: "5%", // Center the tab bar

            // Add a subtle shadow for depth
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          },
          // Use the BlurView as the background for the tab bar
          tabBarBackground: () => (
            <BlurView
              tint="light" // 'light', 'dark', or 'default'
              intensity={90} // Adjust blur intensity (0-100)
              style={{
                flex: 1,
                borderRadius: 25,
                overflow: "hidden", // Important for the borderRadius to apply to the blur
              }}
            />
          ),
          // --- END OF NEW SECTION ---
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Persona Score",
            tabBarLabel: ({ focused, color }) => (
              <Text
                style={{
                  color,
                  fontSize: focused ? 14 : 13,
                  fontWeight: focused ? "bold" : "normal",
                }}
              >
                Score
              </Text>
            ),
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name="shield-checkmark-outline"
                size={focused ? size + 2 : size}
                color={color}
              />
            ),
            
          }}
        />
        <Tabs.Screen
          name="verify"
          options={{
            title: "Verify Credentials",
            tabBarLabel: ({ focused, color }) => (
              <Text
                style={{
                  color,
                  fontSize: focused ? 14 : 13,
                  fontWeight: focused ? "bold" : "normal",
                }}
              >
                Verify
              </Text>
            ),
            tabBarIcon: ({ focused, color, size }) => (
              <FontAwesome
                name="plus-square-o"
                size={focused ? size + 2 : size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: "Exclusive Rewards",
            tabBarLabel: ({ focused, color }) => (
              <Text
                style={{
                  color,
                  fontSize: focused ? 14 : 13,
                  fontWeight: focused ? "bold" : "normal",
                }}
              >
                Rewards
              </Text>
            ),
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name="gift-outline"
                size={focused ? size + 2 : size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </PersonaProvider>
  );
}
