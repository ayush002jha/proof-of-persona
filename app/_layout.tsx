// app/_layout.tsx
import "../global.css"
import "react-native-reanimated";
import "react-native-get-random-values";
import { Stack } from "expo-router";
import { AbstraxionProvider } from "@burnt-labs/abstraxion-react-native";
import { Buffer } from "buffer";
import crypto from "react-native-quick-crypto";
global.crypto = crypto;
global.Buffer = Buffer;

const treasuryConfig = {
  treasury: process.env.EXPO_PUBLIC_TREASURY_CONTRACT_ADDRESS!,
  rpcUrl: process.env.EXPO_PUBLIC_RPC_ENDPOINT,
  restUrl: process.env.EXPO_PUBLIC_REST_ENDPOINT,
  callbackUrl: "personapp://", // From app.json scheme
};

export default function RootLayout() {
  return (
    <AbstraxionProvider config={treasuryConfig}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AbstraxionProvider>
  );
}