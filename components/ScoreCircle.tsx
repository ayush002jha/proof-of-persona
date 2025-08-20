// components/ScoreCircle.tsx
import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ScoreCircleProps {
  score: number;
  rating: string;
  size: number;
  strokeWidth: number;
}

const SCORE_COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#f97316']; // Blue, Green, Purple, Orange

export const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, rating, size, strokeWidth }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = score / 100;
  const strokeDashoffset = circumference - circumference * progress;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={SCORE_COLORS[0]} />
            <Stop offset="33%" stopColor={SCORE_COLORS[1]} />
            <Stop offset="66%" stopColor={SCORE_COLORS[2]} />
            <Stop offset="100%" stopColor={SCORE_COLORS[3]} />
          </LinearGradient>
        </Defs>
        {/* Background Circle */}
        <Circle
          stroke="#e0f2fe"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <Circle
          stroke="url(#grad)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center justify-center">
        <Text className="text-5xl font-bold text-gray-800">{score}</Text>
        <Text className="text-xl text-gray-500">{rating}</Text>
      </View>
    </View>
  );
};