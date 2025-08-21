// constants/providers.ts
import { Ionicons } from "@expo/vector-icons";

export interface PersonaProvider {
  id: string;
  name: string;
  description: string;
  key: "twitter" | "github" | "binance" | "linkedin" | "twitterTweets";
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string; // Add a color for each provider's icon
}

export const PERSONA_PROVIDERS: PersonaProvider[] = [
  {
    id: "e6fe962d-8b4e-4ce5-abcc-3d21c88bd64a",
    name: "Twitter",
    description: "Verify followers and account age",
    key: "twitter",
    iconName: "logo-twitter",
    iconColor: "#1DA1F2",
  },
  {
    id: "76afcf07-4c8f-4a63-b545-0d4c4f955164",
    name: "GitHub",
    description: "Verify contributions and followers",
    key: "github",
    iconName: "logo-github",
    iconColor: "#333",
  },
  {
    id: "2b22db5c-78d9-4d82-84f0-a9e0a4ed0470",
    name: "Binance",
    description: "Verify your account KYC status",
    key: "binance",
    iconName: "logo-bitcoin",
    iconColor: "#F7931A",
  }, // Example icon
  {
    id: "a9f1063c-06b7-476a-8410-9ff6e2e427e637",
    name: "LinkedIn",
    description: "Verify professional connections",
    key: "linkedin",
    iconName: "logo-linkedin",
    iconColor: "#0A66C2",
  },
  {
    id: "8f548df0-4a8b-4672-b1fb-f103cbf51832",
    name: "Twitter Activity",
    description: "Verify you are an active user",
    key: "twitterTweets",
    iconName: "logo-twitter",
    iconColor: "#1DA1F2",
  },
];
