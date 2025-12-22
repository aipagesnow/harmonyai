import { App } from "@slack/bolt";
import { analyzeMessage } from "../services/aiService";
import { db } from "../services/database";
import { alertService } from "../services/alertService";

export function registerMessageHandlers(app: App) {
    app.message(async ({ message, say, context }) => {
        const msg = message as any;

        // 1. FILTER: Ignore bot messages, edits, deletions, thread broadcasts
        // 'subtype' handles edits (message_changed), joins, leaves, etc.
        // bot_id / bot_profile handles bot users
        if (msg.subtype || msg.bot_id || msg.bot_profile) {
            return;
        }

        // Ignore messages without text
        if (!msg.text) return;

        // Privacy: Only process public channels (though app.message triggers on anything the bot is in)
        if (msg.channel_type === 'im') {
            return; // Ignore DMs for monitoring
        }

        const text = msg.text;

        // 2. Analyze
        const analysis = await analyzeMessage(text);

        // 3. Log (Aggregated)
        // message.ts is the timestamp ID of the message
        await db.logSentiment(msg.team, msg.channel, analysis.sentimentScore, analysis.frictionDetected, msg.ts);

        // 3. Proactive Alerting
        const health = await db.getChannelHealth(msg.channel);
        if (health) {
            await alertService.checkAlerts(app, msg.team, msg.channel, health);
        }
    });
}
