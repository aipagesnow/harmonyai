import { App } from "@slack/bolt";
import { db } from "./database";
import { ChannelHealth } from "@harmony-ai/shared";

export const alertService = {
    // Check triggers after log update
    checkAlerts: async (app: App, teamId: string, channelId: string, currentHealth: ChannelHealth) => {
        // 1. Fetch channel settings if available (mock/default for now)
        // const settings = await db.getChannelSettings(...) 
        const threshold = -0.5;

        if (currentHealth.sentimentScore < threshold || currentHealth.frictionDetected) {
            // Throttling: Check last alert time in DB? (Skip for MVP demo)

            // Send DM to Admin (assuming we know the admin ID, or just log)
            // In real app: Look up workspace admin or configured user
            const workspace = await db.getWorkspace(teamId);
            if (workspace && workspace.bot_user_id) {
                // We can't easily DM the admin without storing their ID.
                // For MVP, we will post to a private channel if it exists, or just log.
                console.log(`[ALERT] Low Harmony in ${channelId} (Team: ${teamId}). Score: ${currentHealth.sentimentScore}`);

                // If we have an installer/admin user ID stored in metadata, we could DM.
                // For now, let's assume we post an ephemeral message if it was triggered by a command, but here it's async.
                // We'll skip actual DM sending to avoid spamming in demo without real users.
            }
        }
    },

    sendWeeklySummary: async (app: App, teamId: string, channelId: string) => {
        // Aggregate data from DB
        const health = await db.getChannelHealth(channelId);
        if (!health) return;

        const message = `
*Weekly Harmony Report* for <#${channelId}>
📊 Average Vibe: ${health.sentimentScore.toFixed(2)}
🔥 Friction Events: ${health.frictionDetected ? 'Detected' : 'None'}
      `;

        // Post to channel (or DM)
        try {
            await app.client.chat.postMessage({
                token: process.env.SLACK_BOT_TOKEN, // Or team token
                channel: channelId,
                text: message
            });
        } catch (e) {
            console.error("Failed to send summary", e);
        }
    }
};
