// contexts/PersonaContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAbstraxionAccount, useAbstraxionClient } from '@burnt-labs/abstraxion-react-native';
import { useFocusEffect } from 'expo-router';

const DOCUSTORE_ADDRESS = process.env.EXPO_PUBLIC_DOCUSTORE_CONTRACT_ADDRESS!;

// Define the shape of our context data
interface PersonaContextType {
    persona: any;
    loading: boolean;
    error: string | null;
    fetchPersona: () => Promise<void>;
}

// Create the context with a default undefined value
const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

// Create the provider component
export const PersonaProvider = ({ children }: { children: ReactNode }) => {
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
            const queryMsg = { UserDocuments: { owner: account.bech32Address, collection: "personas" } };
            const response = await queryClient.queryContractSmart(DOCUSTORE_ADDRESS, queryMsg);
            if (response?.documents?.length > 0) {
                const userDoc = response.documents.find((doc: [string, any]) => doc[0] === account.bech32Address);
                setPersona(userDoc?.[1]?.data ? JSON.parse(userDoc[1].data) : null);
            } else {
                setPersona(null);
            }
        } catch (err) {
            setError("Could not fetch persona.");
            setPersona(null);
        } finally {
            setLoading(false);
        }
    }, [queryClient, account?.bech32Address]);

    useFocusEffect(useCallback(() => { fetchPersona(); }, [fetchPersona]));

    const value = { persona, loading, error, fetchPersona };

    return (
        <PersonaContext.Provider value={value}>
            {children}
        </PersonaContext.Provider>
    );
};

// Create a custom hook for easy consumption of the context
export const usePersona = () => {
    const context = useContext(PersonaContext);
    if (context === undefined) {
        throw new Error('usePersona must be used within a PersonaProvider');
    }
    return context;
};