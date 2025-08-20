export interface PersonaProvider {
    id: string; // The unique Provider ID from Reclaim's website
    name: string;
    description: string;
}

export const PERSONA_PROVIDERS: PersonaProvider[] = [
    { id: 'e6fe962d-8b4e-4ce5-abcc-3d21c88bd64a', name: 'Twitter / X', description: 'Verify your social influence' },
    { id: '8ce3c937-b5d7-4034-8b65-92633011904a', name: 'GitHub', description: 'Verify your code contributions' },
    { id: '35a78b54-fe75-474e-89a6-5a815121b2', name: 'Binance', description: 'Verify your KYC status'},
];