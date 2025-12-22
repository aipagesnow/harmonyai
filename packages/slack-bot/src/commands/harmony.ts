import { App } from "@slack/bolt";
import { db } from "../services/database";

export function registerCommands(app: App) {
    // Handle /harmony-pulse slash command
    app.command('/harmony-pulse', async ({ command, ack, say }) => {
        // Acknowledge immediately to prevent timeout/dispatch_failed
        await ack();

        try {
            console.log('🔥 /harmony-pulse triggered by', command.user_id, 'in channel', command.channel_id);

            // Async work: query sentiment_logs for command.channel_id
            const health = await db.getChannelHealth(command.channel_id);

            if (!health) {
                await say("I haven't collected enough data for this channel yet to calculate a pulse. Keep chatting! 💬");
                return;
            }

            let statusEmoji = "🟢";
            if (health.sentimentScore < -0.3) statusEmoji = "🔴";
            else if (health.sentimentScore < 0.2) statusEmoji = "🟡";

            const frictionMsg = health.frictionDetected
                ? "\n⚠️ *Note:* I detected some potential friction recently."
                : "";

            // Send visible response to channel
            await say(`*Channel Pulse: ${statusEmoji}*\nCurrent Vibe Score: ${health.sentimentScore.toFixed(2)}${frictionMsg} \n_Scores range from -1 (Negative) to +1 (Positive)_`);

        } catch (error) {
            console.error('Pulse error:', error);
            await say("Sorry, couldn't calculate pulse right now.");
        }
    });

    // Handle /harmony slash command (optional fallback)
    app.command('/harmony', async ({ command, ack, respond }) => {
        await ack();
        console.log('🔥 /harmony triggered by', command.user_id);

        await respond({
            response_type: 'ephemeral',
            text: 'HarmonyAI received /harmony — use `/harmony-pulse` for the latest check! 🌟'
        });
    });

    // Legacy /harmony with subcommands (keeping for backward compatibility)
    app.command("/harmony-legacy", async ({ command, ack, respond }) => {
        await ack();

        try {
            // Parse subcommands: pulse, status, help, forecast, plan
            const args = command.text.trim().split(" ");
            const subCommand = args[0]?.toLowerCase();
            const channelId = command.channel_id;

            if (subCommand === "pulse" || subCommand === "status") {
                const health = await db.getChannelHealth(channelId);

                if (!health) {
                    await respond({
                        response_type: "ephemeral",
                        text: "I haven't collected enough data for this channel yet. Keep chatting! 💬"
                    });
                    return;
                }

                let statusEmoji = "🟢";
                if (health.sentimentScore < -0.3) statusEmoji = "🔴";
                else if (health.sentimentScore < 0.2) statusEmoji = "🟡";

                const frictionMsg = health.frictionDetected
                    ? "\n⚠️ *Note:* I detected some potential friction recently."
                    : "";

                await respond({
                    response_type: "ephemeral",
                    text: `*Channel Pulse: ${statusEmoji}*\nCurrent Vibe Score: ${health.sentimentScore.toFixed(2)}${frictionMsg} \n_Scores range from -1 (Negative) to +1 (Positive)_`
                });

            } else if (subCommand === "forecast") {
                // Mock Forecast Logic
                const health = await db.getChannelHealth(channelId);
                const trend = health && health.sentimentScore < 0 ? "declining" : "stable";

                await respond({
                    response_type: "ephemeral",
                    text: `*Harmony Forecast* 🔮\nBased on recent trends, team energy is *${trend}*.\n\n*Suggestion:* Schedule a sync if you see repeated friction.`
                });

            } else if (subCommand === "plan") {
                await respond({
                    response_type: "ephemeral",
                    text: `Current Plan: *Free Trial*\n\nUpgrade logic available in dashboard.`
                });
            } else {
                await respond({
                    response_type: "ephemeral",
                    text: "Available commands:\n`/harmony pulse` - Vibe check\n`/harmony forecast` - Next week prediction\n`/harmony plan` - Subscription info\n`/harmony help` - This menu"
                });
            }
        } catch (error) {
            console.error("Legacy command error:", error);
            await respond({
                response_type: 'ephemeral',
                text: "An error occurred while processing your command."
            });
        }
    });
}
