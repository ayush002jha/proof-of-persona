// components/CreateRewardModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion-react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;
const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY!;
if (!PEXELS_API_KEY) {
  console.warn("Pexels API Key is missing. Image generation will not work.");
}
interface CreateRewardModalProps {
  onClose: () => void;
}

// This function now returns an array of keywords, from most to least specific
const getKeywordTiers = (title: string): string[] => {
  const lowercasedTitle = title.toLowerCase();
  if (
    lowercasedTitle.includes("crypto") ||
    lowercasedTitle.includes("airdrop") ||
    lowercasedTitle.includes("bitcoin")
  ) {
    return ["blockchain", "crypto", "abstract"];
  }
  if (
    lowercasedTitle.includes("community") ||
    lowercasedTitle.includes("chat")
  ) {
    return ["community", "network", "people"];
  }
  if (
    lowercasedTitle.includes("github") ||
    lowercasedTitle.includes("developer") ||
    lowercasedTitle.includes("code")
  ) {
    return ["code", "developer", "programming"];
  }
  if (
    lowercasedTitle.includes("concert") ||
    lowercasedTitle.includes("vip") ||
    lowercasedTitle.includes("event")
  ) {
    return ["concert", "event", "music festival"];
  }
  if (lowercasedTitle.includes("social")) {
    return ["social media", "network", "people"];
  }
  return ["technology", "abstract", "modern"]; // Default fallback tiers
};

// This function will now try each keyword in order until it finds a good image
const getThemedImageUrl = async (title: string): Promise<string> => {
  if (!PEXELS_API_KEY || !title) return "";

  const keywordTiers = getKeywordTiers(title);

  for (const keyword of keywordTiers) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=15&orientation=landscape`;
    console.log(`Trying Pexels with keyword: ${keyword}`);

    try {
      const response = await fetch(url, {
        headers: { Authorization: PEXELS_API_KEY },
      });
      if (!response.ok) {
        console.error(
          `Pexels API failed for keyword "${keyword}":`,
          response.status
        );
        continue; // Try the next keyword
      }
      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        const randomPhoto =
          data.photos[Math.floor(Math.random() * data.photos.length)];
        // Return the "landscape" version which is better for cards
        return randomPhoto.src.landscape;
      }
    } catch (error) {
      console.error(
        `Error fetching from Pexels with keyword "${keyword}":`,
        error
      );
    }
  }

  // If no keywords returned an image, return an empty string
  console.log("No images found for any keywords.");
  return "";
};

export const CreateRewardModal: React.FC<CreateRewardModalProps> = ({
  onClose,
}) => {
  const { data: account } = useAbstraxionAccount();
  const { client: signingClient } = useAbstraxionSigningClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredScore, setRequiredScore] = useState(50);
  const [imageUrl, setImageUrl] = useState(""); // Changed from "value" to "imageUrl"
  const [isLoading, setIsLoading] = useState(false);
  // A separate state for the actual reward value/link
  const [rewardValue, setRewardValue] = useState("");
  // --- Gesture and Animation State ---
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      // Allow swiping down only
      translateY.value = Math.max(0, event.translationY + context.value.y);
    })
    .onEnd(() => {
      // If swiped down more than 100 pixels, close the modal
      if (translateY.value > 100) {
        runOnJS(onClose)();
      } else {
        // Otherwise, spring back to the original position
        translateY.value = withSpring(0, { damping: 50 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });
  // --- End of Gesture Logic ---

  useEffect(() => {
    const handler = setTimeout(() => {
      if (title) {
        getThemedImageUrl(title).then(setImageUrl);
      } else {
        setImageUrl(""); // Clear image if title is empty
      }
    }, 800); // Increased debounce for API calls

    return () => clearTimeout(handler);
  }, [title]);

  const handleCreateReward = async () => {
    if (!account || !signingClient)
      return Alert.alert("Error", "Client not ready.");
    if (!title || !description || !requiredScore || !imageUrl || !rewardValue) {
      return Alert.alert(
        "Error",
        "All fields, including the reward link/value, are required."
      );
    }
    setIsLoading(true);
    try {
      const rewardId = Date.now().toString();
      // We now save both the imageUrl and the rewardValue
      const rewardData = {
        title,
        description,
        imageUrl, // The visual for the card
        value: rewardValue, // The actual reward link/code
        requiredScore: Math.round(requiredScore),
        creatorAddress: account.bech32Address,
        createdAt: new Date().toISOString(),
      };
      const writeMsg = {
        Set: {
          collection: "rewards",
          document: rewardId,
          data: JSON.stringify(rewardData),
        },
      };
      await signingClient.execute(
        account.bech32Address,
        DOCUSTORE_ADDRESS,
        writeMsg,
        "auto"
      );
      Alert.alert(
        "Success!",
        "Your exclusive reward has been created on-chain."
      );
      onClose();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create reward.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animatedStyle, { width: "100%" }]}>
        <Pressable>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%" }}
          >
            <View className="w-full bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl p-6 pt-3">
              <View className="w-10 h-1.5 bg-gray-300 rounded-full self-center mb-4" />
              <Text className="text-2xl font-bold text-center mb-6">
                Create New Exclusive Reward
              </Text>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  className="w-full h-40 rounded-lg mb-4 bg-gray-200"
                />
              ) : (
                <View className="w-full h-40 rounded-lg mb-4 bg-gray-200 justify-center items-center">
                  <Text className="text-gray-500">Image will appear here</Text>
                </View>
              )}
              {/* --- The form fields --- */}
              <Text className="text-base font-medium text-gray-600 mb-2">
                Title
              </Text>
              <TextInput
                placeholder="e.g. Early Access to Beta"
                value={title}
                onChangeText={setTitle}
                className="bg-gray-100 border border-gray-300 text-base p-3 rounded-lg mb-4"
              />

              <Text className="text-base font-medium text-gray-600 mb-2">
                Description
              </Text>
              <TextInput
                placeholder="Describe the reward in detail"
                value={description}
                onChangeText={setDescription}
                className="bg-gray-100 border border-gray-300 text-base p-3 rounded-lg mb-4 h-24"
                multiline
                textAlignVertical="top"
              />
              <Text className="text-base font-medium text-gray-600 mb-2">
                Reward Value (Link, Code, etc.)
              </Text>
              <TextInput
                placeholder="https://t.me/private-group"
                value={rewardValue}
                onChangeText={setRewardValue}
                className="bg-gray-100 border border-gray-300 text-base p-3 rounded-lg mb-4"
                autoCapitalize="none"
              />
              <Text className="text-base font-medium text-gray-600 mb-2">
                Image URL (auto-generated from title)
              </Text>
              <TextInput
                value={imageUrl}
                onChangeText={setImageUrl}
                className="bg-gray-100 border border-gray-300 text-base p-3 rounded-lg mb-4"
                autoCapitalize="none"
              />

              <Text className="text-base font-medium text-gray-600 mb-2">
                Minimum Persona Score
              </Text>
              <View className="flex-row items-center mb-6">
                <Slider
                  style={{ flex: 1 }}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={requiredScore}
                  onValueChange={setRequiredScore}
                  minimumTrackTintColor="#007AFF"
                  maximumTrackTintColor="#d1d5db"
                  thumbTintColor="#007AFF"
                />
                <Text className="text-lg font-semibold w-12 text-right">
                  {Math.round(requiredScore)}
                </Text>
              </View>

              <TouchableOpacity
                className={`w-full py-4 rounded-xl items-center ${isLoading ? "bg-blue-300" : "bg-blue-500"}`}
                onPress={handleCreateReward}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    Create Reward
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};
