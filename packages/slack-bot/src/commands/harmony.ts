import { App } from "@slack/bolt";
import { db } from "../services/database";

export function registerCommands(app: App) {
    // Handle /harmony-pulse slash command
    app.command('/harmony-pulse', async ({ command, ack, say }) => {
        await ack(); // Immediate acknowledgment

        try {
            // Initialize Supabase (or import a detailed client)
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

            // Async work: query sentiment_logs for command.channel_id
            const { data: logs } = await supabase
                .from('sentiment_logs')
                .select('sentiment_score, friction_detected')
                .eq('channel_id', command.channel_id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!logs || logs.length === 0) {
                await say('No messages analyzed yet in this channel — post a few and try again!');
                return;
            }

            const average = logs.reduce((sum: number, log: any) => sum + log.sentiment_score, 0) / logs.length;
            const frictionCount = logs.filter((log: any) => log.friction_detected).length;

            await say(`*Channel Harmony Pulse*\nAverage sentiment: ${average.toFixed(2)}\nFriction detected in ${frictionCount} of last ${logs.length} messages`);

        } catch (error) {
            console.error('Pulse error:', error);
            await say("Sorry, couldn't calculate pulse right now.");
        }
    });

    // Handle /harmony slash command (optional fallback)
    app.command('/harmony', async ({ command, ack, respond }) => {
        await ack(); // Immediate acknowledgment

        try {
            console.log('🔥 /harmony triggered by', command.user_id);

            await respond({
                response_type: 'ephemeral',
                text: 'HarmonyAI received /harmony — use `/harmony-pulse` for the latest check! 🌟'
            });
        } catch (error) {
            console.error('Harmony command error:', error);
            await respond({
                response_type: 'ephemeral',
                text: "Sorry, something went wrong with the command."
            });
        }
    });

    // Legacy /harmony with subcommands (keeping for backward compatibility)
    app.command("/harmony-legacy", async ({ command, ack, respond }) => {
        await ack(); // Immediate acknowledgment

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
