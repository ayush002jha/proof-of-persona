// app/(tabs)/_layout.tsx
import { Tabs, router } from "expo-router";
import React, { useState, useCallback } from "react";
import { View, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePersona, PersonaProvider } from "@/hooks/PersonaContext";
import { HeaderLogoutButton } from "@/components/HeaderLogoutButton";
import { CreateRewardModal } from "@/components/CreateRewardModal";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MyRewardsScreen from "./my-rewards";
import RewardsScreen from "./rewards";

const Tab = createMaterialTopTabNavigator();
const SCORE_TO_CREATE_REWARD = 0;

// A new component to contain the logic for the button and modal
const MainAppLayout = () => {
  const { persona } = usePersona();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const userScore = persona?.personaScore?.score || 0;

  const handleCreationSuccess = () => {
    setIsModalVisible(false);
    // This is a trick to force the screens to refresh their data
    router.replace({
      pathname: "/my-rewards",
      params: { refresh: Date.now() },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator>
        <Tab.Screen name="Community Rewards" options={{}} component={RewardsScreen}/>
        <Tab.Screen name="My Rewards"  component={MyRewardsScreen}/>
      </Tab.Navigator>

      {userScore >= SCORE_TO_CREATE_REWARD && (
        <TouchableOpacity
          className="absolute bottom-28 right-5 w-16 h-16 rounded-full bg-blue-500 justify-center items-center shadow-lg"
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}

      <Modal visible={isModalVisible} animationType="slide" transparent={true}         statusBarTranslucent={true} navigationBarTranslucent={true}>
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPressOut={() => setIsModalVisible(false)}
        >
          <CreateRewardModal onClose={handleCreationSuccess} />
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// The final export now uses this new layout component
export default function TabLayout() {
  return (
    <PersonaProvider>
      <MainAppLayout />
    </PersonaProvider>
  );
}
