// services/scoreEngine.ts
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenAI({ apiKey: API_KEY });

export async function generatePersonaScore(verifications: any): Promise<any> {
  let promptData =
    "Analyze the following verified user data to generate a 'Persona Score' out of 100 which will be average of all categories you give score for.\n";
  promptData +=
    "Provide a score, a breakdown into four categories, and a short, encouraging explanation.\n";
  promptData +=
    "The categories are: developerReputation, socialInfluence, financialTrust, and professionalism.\n\n";

  if (verifications.github) {
    promptData += `- GitHub: ${verifications.github.contributionsLastYear} contributions, ${verifications.github.followers} followers.\n`;
  }
  if (verifications.twitter) {
    promptData += `- Twitter: ${verifications.twitter.followers} followers, account created in ${new Date(verifications.twitter.createdAt).getFullYear()}.\n`;
  }
  if (verifications.binance) {
    promptData += `- Binance: KYC status is ${verifications.binance.kycStatus}.\n`;
  }
  if (verifications.linkedin) {
    promptData += `- LinkedIn: ${verifications.linkedin.connections} connections.\n`;
  }

  if (verifications.twitterTweets?.tweetCount > 0) {
    promptData += `- Twitter Activity: Active user (posted recently).\n`;
  }

  if (Object.keys(verifications).length === 0) {
    return {
      score: 10,
      breakdown: {
        developerReputation: 0,
        socialInfluence: 0,
        financialTrust: 0,
        professionalism: 0,
      },
      explanation:
        "Persona not yet established. Add some verifications to build your score!",
      lastCalculatedAt: new Date().toISOString(),
    };
  }

  promptData +=
    '\nOutput ONLY a valid JSON object following this schema: { "score": number, "breakdown": { "developerReputation": number, "socialInfluence": number, "financialTrust": number, "professionalism": number }, "explanation": "string" }';

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptData,
      config: { responseMimeType: "application/json" },
    });
    if (!result.text) {
      throw new Error("No response text from Gemini API.");
    }
    const scoreData = JSON.parse(result.text);
    return { ...scoreData, lastCalculatedAt: new Date().toISOString() };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      score: 0,
      breakdown: {},
      explanation: "Could not calculate score.",
      lastCalculatedAt: new Date().toISOString(),
    };
  }
}
