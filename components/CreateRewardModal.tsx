// components/CreateRewardModal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useAbstraxionAccount, useAbstraxionSigningClient } from '@burnt-labs/abstraxion-react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;

interface CreateRewardModalProps {
    onClose: () => void;
}

// Function to get a random image URL from Picsum Photos
const getRandomImageUrl = () => {
    const randomId = Math.floor(Math.random() * 500); // Get a random image ID
    // The "grayscale" and "blur" parameters give it a cool, artifact-like feel
    return `https://picsum.photos/id/${randomId}/600/400?grayscale&blur=2`;
};

export const CreateRewardModal: React.FC<CreateRewardModalProps> = ({ onClose }) => {
    const { data: account } = useAbstraxionAccount();
    const { client: signingClient } = useAbstraxionSigningClient();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requiredScore, setRequiredScore] = useState(50);
    const [imageUrl, setImageUrl] = useState(''); // Changed from "value" to "imageUrl"
    const [isLoading, setIsLoading] = useState(false);

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
    
    // Set a random image URL when the component mounts
    useEffect(() => {
        setImageUrl(getRandomImageUrl());
    }, []);

    const handleCreateReward = async () => {
        if (!account || !signingClient) return Alert.alert("Error", "Client not ready.");
        if (!title || !description || !requiredScore || !imageUrl) {
            return Alert.alert("Error", "All fields are required.");
        }
        setIsLoading(true);
        try {
            const rewardId = Date.now().toString();
            const rewardData = { title, description, imageUrl, requiredScore: Math.round(requiredScore), creatorAddress: account.bech32Address, createdAt: new Date().toISOString() };
            const writeMsg = { Set: { collection: "rewards", document: rewardId, data: JSON.stringify(rewardData) } };
            await signingClient.execute(account.bech32Address, DOCUSTORE_ADDRESS, writeMsg, "auto");
            Alert.alert("Success!", "Your exclusive reward has been created on-chain.");
            onClose();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to create reward.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[animatedStyle, { width: '100%' }]}>
                <Pressable>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ width: '100%' }}
                    >
                        <View className="w-full bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl p-6 pt-3">
                            <View className="w-10 h-1.5 bg-gray-300 rounded-full self-center mb-4" />
                            <Text className="text-2xl font-bold text-center mb-6">Create New Exclusive Reward</Text>

                            {/* --- The form fields --- */}
                            <Text className="text-base font-medium text-gray-600 mb-2">Title</Text>
                            <TextInput placeholder="e.g. Early Access to Beta" value={title} onChangeText={setTitle} className="bg-gray-100 border border-gray-300 text-base p-3 rounded-lg mb-4" />
                            
                            <Text className="text-base font-medium text-gray-600 mb-2">Description</Text>
                            <TextInput placeholder="Describe the reward in detail" value={description} onChangeText={setDescription} className="bg-gray-100 border border-gray-300 text-base p-3 rounded-lg mb-4 h-24" multiline textAlignVertical="top" />
                            
                            <Text className="text-base font-medium text-gray-600 mb-2">Image URL (randomly generated)</Text>
                            <TextInput value={imageUrl} onChangeText={setImageUrl} className="bg-gray-100 border border-gray-300 text-base p-3 rounded-lg mb-4" autoCapitalize="none" />
                            
                            <Text className="text-base font-medium text-gray-600 mb-2">Minimum Persona Score</Text>
                            <View className="flex-row items-center mb-6">
                                <Slider style={{ flex: 1 }} minimumValue={0} maximumValue={100} step={1} value={requiredScore} onValueChange={setRequiredScore} minimumTrackTintColor="#007AFF" maximumTrackTintColor="#d1d5db" thumbTintColor="#007AFF" />
                                <Text className="text-lg font-semibold w-12 text-right">{Math.round(requiredScore)}</Text>
                            </View>

                            <TouchableOpacity className={`w-full py-4 rounded-xl items-center ${isLoading ? 'bg-blue-300' : 'bg-blue-500'}`} onPress={handleCreateReward} disabled={isLoading}>
                                {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Create Reward</Text>}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Pressable>
            </Animated.View>
        </GestureDetector>
    );
};