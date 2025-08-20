// hooks/usePersona.ts
import { useState, useCallback } from 'react';
import { useAbstraxionAccount, useAbstraxionClient } from '@burnt-labs/abstraxion-react-native';
import { useFocusEffect } from 'expo-router';

const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;

export const usePersona = () => {
    const { data: account } = useAbstraxionAccount();
    const { client: queryClient } = useAbstraxionClient();
    const [persona, setPersona] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPersona = useCallback(async () => {
        if (!queryClient || !account?.bech32Address) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const queryMsg = {
                UserDocuments: {
                    owner: account.bech32Address,
                    collection: "personas",
                }
            };
            const response = await queryClient.queryContractSmart(DOCUSTORE_ADDRESS, queryMsg);
            if (response && response.documents && response.documents.length > 0) {
                const userDocTuple = response.documents.find((doc: [string, any]) => doc[0] === account.bech32Address);
                if (userDocTuple && userDocTuple[1] && userDocTuple[1].data) {
                    setPersona(JSON.parse(userDocTuple[1].data));
                } else {
                    setPersona(null);
                }
            } else {
                setPersona(null);
            }
        } catch (err: any) {
            setError("Could not fetch persona.");
            setPersona(null);
        } finally {
            setLoading(false);
        }
    }, [queryClient, account?.bech32Address]);

    useFocusEffect(
        useCallback(() => {
            fetchPersona();
        }, [fetchPersona])
    );

    return { persona, loading, error, fetchPersona };
};