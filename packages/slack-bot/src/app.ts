import { App, ExpressReceiver, LogLevel } from "@slack/bolt";
import * as dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js';
import { registerMessageHandlers } from "./handlers/messageHandler";
import { registerEventHandlers } from "./handlers/eventHandler";
import { registerCommands } from "./commands/harmony";
import { registerModalHandlers } from "./handlers/modalHandler";

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
});

const app = new App({
    receiver,
    authorize: async ({ teamId }) => {
        if (!teamId) {
            throw new Error('Missing teamId in authorize');
        }

        const { data, error } = await supabase
            .from('workspaces')
            .select('access_token, bot_user_id')
            .eq('team_id', teamId)
            .single();

        if (error || !data?.access_token) {
            console.error('Authorize failed for team', teamId, error);
            throw new Error('Workspace not found or missing access_token');
        }

        return {
            botToken: data.access_token,
            botUserId: data.bot_user_id ?? undefined,
        };
    },
    // Serverless: Process before sending response to avoid timeouts
    processBeforeResponse: true,
    logLevel: LogLevel.DEBUG,
});

// Register Event Listeners
registerMessageHandlers(app);
registerEventHandlers(app);
registerCommands(app);
registerModalHandlers(app);

// Export for Vercel / Cloud Functions
export { app, receiver };

// Only start locally if this file is run directly (not imported)
if (require.main === module) {
    (async () => {
        await app.start(Number(process.env.PORT) || 3000);
        console.log("⚡️ HarmonyAI App is running!");
    })();
}
