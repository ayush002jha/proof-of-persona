// constants/providers.ts

export interface PersonaProvider {
    id: string; // The unique Provider ID from Reclaim's website
    name: string;
    description: string; // This was the missing property
    key: 'twitter' | 'github' | 'binance' | 'linkedin' | 'twitterTweets';  
}

export const PERSONA_PROVIDERS: PersonaProvider[] = [
    { 
        id: 'e6fe962d-8b4e-4ce5-abcc-3d21c88bd64a', 
        name: 'Twitter / X Profile', 
        description: 'Verify your followers and account age', 
        key: 'twitter' 
    },
    { 
        id: '76afcf07-4c8f-4a63-b545-0d4c4f955164', 
        name: 'GitHub Profile', 
        description: 'Verify your contributions and followers', 
        key: 'github' 
    },
    { 
        id: '2b22db5c-78d9-4d82-84f0-a9e0a4ed0470', 
        name: 'Binance KYC', 
        description: 'Verify your account KYC status', 
        key: 'binance' 
    },
    { 
        id: 'a9f1063c-06b7-476a-8410-9ff6e427e637', 
        name: 'LinkedIn Profile', 
        description: 'Verify your professional connections', 
        key: 'linkedin' 
    },
    { 
        id: '8f548df0-4a8b-4672-b1fb-f103cbf51832', 
        name: 'Twitter Activity', 
        description: 'Verify you are an active user', 
        key: 'twitterTweets' 
    },
];