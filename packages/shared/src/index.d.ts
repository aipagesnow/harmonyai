export type SentimentScore = number;
export interface ChannelHealth {
    channelId: string;
    sentimentScore: SentimentScore;
    lastUpdated: Date;
    frictionDetected: boolean;
    messageCount?: number;
}
export interface WorkspaceConfig {
    id: string;
    teamId: string;
    accessToken: string;
    plan: 'free' | 'pro' | 'team';
}
export interface ChannelSettings {
    alertThreshold: number;
    adminAlerts: boolean;
}
