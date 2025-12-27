import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AnalysisResult {
    sentimentScore: number; // -1 to 1
    frictionDetected: boolean;
    reasoning?: string;
    category?: 'passive_aggression' | 'misunderstanding' | 'negative_feedback' | 'none';
}

// Simple in-memory rate limiter using token bucket or just time window
// MVP: Limit to 1 request per second per channel (conceptually) or global limit
let lastCallTime = 0;
const MIN_INTERVAL_MS = 1000; // 1 second between calls to avoid hitting free tier limits

export async function analyzeMessage(text: string): Promise<AnalysisResult> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY not set, returning neutral result.");
        return { sentimentScore: 0, frictionDetected: false };
    }

    // Rate Limiting
    const now = Date.now();
    if (now - lastCallTime < MIN_INTERVAL_MS) {
        await new Promise(r => setTimeout(r, MIN_INTERVAL_MS - (now - lastCallTime)));
    }
    lastCallTime = Date.now();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze the following Slack message for sentiment and potential workplace friction.
    Focus on detecting passive aggression, repeated misunderstanding, or harsh feedback.
    
    Message: "${text}"
    
    Output JSON ONLY with the following format:
    {
      "sentimentScore": number, // Float between -1.0 (very negative) and 1.0 (very positive)
      "frictionDetected": boolean, // True if significant friction/conflict risk
      "category": "string", // One of: "passive_aggression", "misunderstanding", "negative_feedback", "none"
      "reasoning": "string" // Brief explanation (max 1 sentence)
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanText) as AnalysisResult;
    } catch (error) {
        console.error("Error analyzing message with Gemini:", error);
        return { sentimentScore: 0, frictionDetected: false };
    }
}
