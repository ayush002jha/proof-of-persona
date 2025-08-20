// app/_layout.tsx
import "../global.css";
import "react-native-reanimated";
import "react-native-get-random-values";
import { Stack } from "expo-router";
import { AbstraxionProvider } from "@burnt-labs/abstraxion-react-native";
import { Buffer } from "buffer";
import crypto from "react-native-quick-crypto";
import { GestureHandlerRootView } from "react-native-gesture-handler";
global.crypto = crypto;
global.Buffer = Buffer;

const treasuryConfig = {
  treasury: process.env.EXPO_PUBLIC_TREASURY_CONTRACT_ADDRESS,
  gasPrice: "0.001uxion", // If you feel the need to change the gasPrice when connecting to signer, set this value. Please stick to the string format seen in example
  rpcUrl: process.env.EXPO_PUBLIC_RPC_ENDPOINT,
  restUrl: process.env.EXPO_PUBLIC_REST_ENDPOINT,
  callbackUrl: "personapp://", // From app.json scheme
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AbstraxionProvider config={treasuryConfig}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AbstraxionProvider>
    </GestureHandlerRootView>
  );
}
