// components/CreateRewardModal.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useAbstraxionAccount, useAbstraxionSigningClient } from '@burnt-labs/abstraxion-react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;

interface CreateRewardModalProps {
    onClose: () => void;
}

export const CreateRewardModal: React.FC<CreateRewardModalProps> = ({ onClose }) => {
    const { data: account } = useAbstraxionAccount();
    const { client: signingClient } = useAbstraxionSigningClient();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requiredScore, setRequiredScore] = useState(50);
    const [value, setValue] = useState(''); // The exclusive link/image URL
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateReward = async () => {
        if (!account || !signingClient) return Alert.alert("Error", "Client not ready.");
        if (!title || !description || !requiredScore || !value) {
            return Alert.alert("Error", "All fields are required.");
        }

        setIsLoading(true);
        try {
            const rewardId = Date.now().toString();
            const rewardData = {
                title,
                description,
                imageUrl: value, // We'll use the "value" field as the image URL
                requiredScore: Math.round(requiredScore),
                creatorAddress: account.bech32Address,
                createdAt: new Date().toISOString(),
            };

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
        <Pressable className="w-full bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl absolute bottom-0 p-6 pt-3">
            <View className="w-10 h-1.5 bg-gray-300 rounded-full self-center mb-4" />
            <Text className="text-2xl font-bold text-center mb-6">Create New Exclusive Reward</Text>

            <Text className="text-base font-medium text-gray-600 mb-2">Title</Text>
            <TextInput
                placeholder="e.g. Early Access to Beta"
                value={title}
                onChangeText={setTitle}
                className="bg-gray-100 border border-gray-300 text-base p-3 rounded-lg mb-4"
            />

            <Text className="text-base font-medium text-gray-600 mb-2">Description</Text>
            <TextInput
                placeholder="Describe the reward in detail"
                value={description}
                onChangeText={setDescription}
                className="bg-gray-100 border border-gray-300 text-base p-3 rounded-lg mb-4 h-24"
                multiline
                textAlignVertical="top"
            />

            <Text className="text-base font-medium text-gray-600 mb-2">Image URL</Text>
            <TextInput
                placeholder="https://imgur.com/your-image.png"
                value={value}
                onChangeText={setValue}
                className="bg-gray-100 border border-gray-300 text-base p-3 rounded-lg mb-4"
                autoCapitalize="none"
            />

            <Text className="text-base font-medium text-gray-600 mb-2">Minimum Persona Score</Text>
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
                <Text className="text-lg font-semibold w-12 text-right">{Math.round(requiredScore)}</Text>
            </View>

            <TouchableOpacity
                className={`w-full py-4 rounded-xl items-center ${isLoading ? 'bg-blue-300' : 'bg-blue-500'}`}
                onPress={handleCreateReward}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Create Reward</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} className="absolute top-4 right-4">
                <Ionicons name="close-circle" size={32} color="#d1d5db" />
            </TouchableOpacity>
        </Pressable>
    );
};