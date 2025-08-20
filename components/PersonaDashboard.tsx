// components/PersonaDashboard.tsx
import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { usePersona } from '@/hooks/PersonaContext';
import { ScoreBreakdownRow } from './ScoreBreakdownRow';
import { NewUserCTA } from './NewUserCTA';
import { ScoreCircle } from './ScoreCircle'; // Import the new component

const getScoreRating = (score: number) => {
    if (score > 80) return "Excellent";
    if (score > 60) return "Good";
    if (score > 40) return "Average";
    return "Building";
};

export const PersonaDashboard = () => {
  // We no longer need `fetchPersona` here as it will be passed to the ScrollView
  const { persona, loading, error } = usePersona();

  if (loading) {
    return <ActivityIndicator size="large" className="my-16" />;
  }
  
  if (error) {
      return <Text className="text-red-500 text-center p-4">{error}</Text>
  }

  if (!persona || !persona.personaScore) {
      return <NewUserCTA />;
  }

  const { score, breakdown } = persona.personaScore;
  const rating = getScoreRating(score);

  return (
    <View className="w-full items-center">
        {/* Main Score Circle - Replaced with our new component */}
        <View className="my-6">
            <ScoreCircle score={score} rating={rating} size={200} strokeWidth={20} />
        </View>

        <Text className="text-base text-gray-600 text-center mb-8 px-4">
            Your Persona Score reflects your reputation across various platforms. A higher score indicates a stronger, more trustworthy online presence.
        </Text>

        {/* Score Breakdown */}
        <View className="w-full">
            <Text className="text-xl font-bold mb-4">Score Breakdown</Text>
            {breakdown && (
                <>
                    <ScoreBreakdownRow label="Developer Reputation" score={breakdown.developerReputation || 0} color="#3b82f6" iconName="code-slash" />
                    <ScoreBreakdownRow label="Social Influence" score={breakdown.socialInfluence || 0} color="#22c55e" iconName="people" />
                    <ScoreBreakdownRow label="Financial Trust" score={breakdown.financialTrust || 0} color="#8b5cf6" iconName="card" />
                    <ScoreBreakdownRow label="Professionalism" score={breakdown.professionalism || 0} color="#f97316" iconName="briefcase" />
                </>
            )}
        </View>
        
        {/* The Refresh Button is now removed from here */}
    </View>
  );
};