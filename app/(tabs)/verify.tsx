// app/(tabs)/verify.tsx
import React, { useMemo } from 'react'; // 1. Import useMemo
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { PERSONA_PROVIDERS } from '../../constants/providers';
import { ConnectionCard } from '../../components/ConnectionCard';
import { router } from 'expo-router';
import { usePersona } from '@/hooks/PersonaContext';

export default function VerifyScreen() {
    const { persona } = usePersona(); // 3. Get the persona data from our context

    // 4. Create a memoized, sorted list of providers.
    //    This list will automatically re-sort whenever the persona data changes.
    const sortedProviders = useMemo(() => {
        // Create a copy to avoid mutating the original constant array
        return [...PERSONA_PROVIDERS].sort((a, b) => {
            const isAVerified = persona?.verifications?.[a.key];
            const isBVerified = persona?.verifications?.[b.key];

            // If a is verified and b is not, b should come first.
            if (isAVerified && !isBVerified) {
                return 1;
            }
            // If a is not verified and b is, a should come first.
            if (!isAVerified && isBVerified) {
                return -1;
            }
            // Otherwise, keep their original order.
            return 0;
        });
    }, [persona]); // The dependency array ensures this runs only when persona changes

    const handleSuccess = () => {
        router.replace('/'); 
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="p-5" style={{paddingBottom: 120}}>
                <Text className="text-base text-gray-600 mb-6">
                    Connect your accounts to build your Persona Score. More accounts you connect, Better your score will be.
                </Text>
                <FlatList
                    // 5. Use the new sortedProviders array as the data source
                    data={sortedProviders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ConnectionCard provider={item} onVerificationComplete={handleSuccess} />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}