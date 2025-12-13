export type SentimentScore = number; // -1.0 to 1.0

export interface ChannelHealth {
    channelId: string;
    sentimentScore: SentimentScore; // Average
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
