import { App } from "@slack/bolt";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export function registerCommands(app: App) {
    // Handle /harmony-pulse slash command
    // Handle /harmony-pulse slash command
    app.command('/harmony-pulse', async (args) => {
        const { command, ack, say } = args;
        console.log('DEBUG: /harmony-pulse entered. Args keys:', Object.keys(args));
        console.log('DEBUG: typeof ack:', typeof ack);
        console.log('DEBUG: command:', JSON.stringify(command));

        await ack(); // Immediate acknowledgment — prevents dispatch_failed

        try {
            console.log('🔥 /harmony-pulse triggered by', command.user_id, 'in channel', command.channel_id);

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

            const average = logs.reduce((sum, log) => sum + log.sentiment_score, 0) / logs.length;
            const frictionCount = logs.filter(log => log.friction_detected).length;

            await say(`*Channel Harmony Pulse*\nAverage sentiment: ${average.toFixed(2)}\nFriction detected in ${frictionCount} of last ${logs.length} messages`);
        } catch (error) {
            console.error('Pulse error:', error);
            await say('Sorry, something went wrong calculating the pulse.');
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
                // Determine health logic - using raw query here to be safe or reusing logic?
                // For legacy, sticking to 'ack first' is key. Logic can fail, but ack must succeed.

                // Re-using the direct query logic for consistency if user wants "Direct Supabase" everywhere?
                // Or sticking to db service? User didn't explicitly ban db service for other commands, but requested "Apply same immediate ack pattern".
                // I will keep the ack first and existing logic, but wrap in try/catch safely.

                const { data: logs } = await supabase
                    .from('sentiment_logs')
                    .select('sentiment_score, friction_detected')
                    .eq('channel_id', channelId)
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (!logs || logs.length === 0) {
                    await respond({
                        response_type: 'ephemeral',
                        text: "I haven't collected enough data for this channel yet. Keep chatting! 💬"
                    });
                    return;
                }

                const average = logs.reduce((sum, log) => sum + log.sentiment_score, 0) / logs.length;
                const hasFriction = logs.some(log => log.friction_detected);

                let statusEmoji = "🟢";
                if (average < -0.3) statusEmoji = "🔴";
                else if (average < 0.2) statusEmoji = "🟡";

                const frictionMsg = hasFriction
                    ? "\n⚠️ *Note:* I detected some potential friction recently."
                    : "";

                await respond({
                    response_type: "ephemeral",
                    text: `*Channel Pulse: ${statusEmoji}*\nCurrent Vibe Score: ${average.toFixed(2)}${frictionMsg} \n_Scores range from -1 (Negative) to +1 (Positive)_`
                });

            } else if (subCommand === "forecast") {
                // Mock Forecast Logic
                // We just need ack() first, which is done.
                await respond({
                    response_type: "ephemeral",
                    text: `*Harmony Forecast* 🔮\nBased on recent trends, team energy is *stable*.\n\n*Suggestion:* Schedule a sync if you see repeated friction.`
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
