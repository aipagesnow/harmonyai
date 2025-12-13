import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ChannelHealth, SentimentScore } from "@harmony-ai/shared";
import * as dotenv from "dotenv";

dotenv.config();

const getSupabase = (): SupabaseClient | null => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (SUPABASE_URL && SUPABASE_KEY) {
        return createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.warn("⚠️ Supabase credentials missing. Falling back to in-memory mock DB.");
        return null;
    }
};

// Fallback in-memory storage
const mockChannelData: Record<string, ChannelHealth> = {};

export const db = {
    logSentiment: async (teamId: string, channelId: string, score: SentimentScore, friction: boolean) => {
        const supabase = getSupabase();
        if (supabase) {
            const { error } = await supabase.from('sentiment_logs').insert({
                team_id: teamId,
                channel_id: channelId,
                sentiment_score: score,
                friction_detected: friction,
                created_at: new Date().toISOString()
            });
            if (error) console.error("Supabase Log Error:", error);
        } else {
            // Mock implementation
            if (!mockChannelData[channelId]) {
                mockChannelData[channelId] = {
                    channelId,
                    sentimentScore: 0,
                    lastUpdated: new Date(),
                    frictionDetected: false,
                    messageCount: 0
                };
            }
            const current = mockChannelData[channelId];
            current.sentimentScore = (current.sentimentScore * 0.7) + (score * 0.3);
            current.lastUpdated = new Date();
            current.frictionDetected = friction || current.frictionDetected;
        }
    },

    getChannelHealth: async (channelId: string): Promise<ChannelHealth | null> => {
        const supabase = getSupabase();
        if (supabase) {
            // Get average sentiment for last 7 days
            // Note: In a real app we'd use a postgres function or aggregation query.
            // For MVP we pull recent logs (cap 100) and average in JS
            const { data, error } = await supabase
                .from('sentiment_logs')
                .select('sentiment_score, friction_detected')
                .eq('channel_id', channelId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error || !data || data.length === 0) return null;

            const avgScore = data.reduce((acc, curr) => acc + curr.sentiment_score, 0) / data.length;
            const hasFriction = data.some(d => d.friction_detected);

            return {
                channelId,
                sentimentScore: avgScore,
                lastUpdated: new Date(),
                frictionDetected: hasFriction,
                messageCount: data.length
            };
        } else {
            return mockChannelData[channelId] || null;
        }
    },

    // Save/Update Workspace Installation
    saveWorkspace: async (teamId: string, teamName: string, accessToken: string) => {
        const supabase = getSupabase();
        if (!supabase) return;

        const { error } = await supabase.from('workspaces').upsert({
            team_id: teamId,
            team_name: teamName,
            access_token: accessToken,
            updated_at: new Date().toISOString()
        }, { onConflict: 'team_id' });

        if (error) console.error("Error saving workspace:", error);
    },

    getWorkspace: async (teamId: string) => {
        const supabase = getSupabase();
        if (!supabase) return null;
        const { data } = await supabase.from('workspaces').select('*').eq('team_id', teamId).single();
        return data;
    }
};
