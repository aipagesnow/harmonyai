import { App } from "@slack/bolt";
import { analyzeMessage } from "../services/aiService";
import { db } from "../services/database";
import { alertService } from "../services/alertService";

export function registerMessageHandlers(app: App) {
    app.message(async ({ message, say, context }) => {
        // Filter out subtype messages (like channel_join, etc.) that don't have text
        if ((message as any).subtype || !(message as any).text) {
            return;
        }

        const msg = message as any; // Cast for easier access properties

        // Privacy: Only process public channels (though app.message triggers on anything the bot is in)
        // We implicitly trust that if the bot is in a channel, it should monitor it.
        // But explicitly check channel type if possible or needed.
        // For now, Bolt's default behavior is fine, but we avoid DMs if not intended.
        if (msg.channel_type === 'im') {
            return; // Ignore DMs for monitoring
        }

        const text = msg.text;

        // 1. Analyze
        const analysis = await analyzeMessage(text);

        // 2. Log (Aggregated)
        await db.logSentiment(msg.team, msg.channel, analysis.sentimentScore, analysis.frictionDetected);

        // 3. Proactive Alerting
        const health = await db.getChannelHealth(msg.channel);
        if (health) {
            await alertService.checkAlerts(app, msg.team, msg.channel, health);
        }
    });
}
