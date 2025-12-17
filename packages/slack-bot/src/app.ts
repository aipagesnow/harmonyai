import { App, ExpressReceiver, LogLevel } from "@slack/bolt";
import * as dotenv from "dotenv";
import { registerMessageHandlers } from "./handlers/messageHandler";
import { registerEventHandlers } from "./handlers/eventHandler";
import { registerCommands } from "./commands/harmony";
import { registerModalHandlers } from "./handlers/modalHandler";
import { db } from "./services/database";

dotenv.config();

// Mode selection: "http" (for Vercel/Serverless) or "socket" (local dev or explicit opt-in)
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const USE_SOCKET_MODE = process.env.SOCKET_MODE === "true" || (!IS_PRODUCTION && process.env.SOCKET_MODE !== "false");

let app: App;
let receiver: ExpressReceiver | undefined;

if (USE_SOCKET_MODE) {
    console.log("🔌 Starting in Socket Mode");
    app = new App({
        token: process.env.SLACK_BOT_TOKEN, // Single workspace dev mode
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        socketMode: true,
        appToken: process.env.SLACK_APP_TOKEN,
        port: Number(process.env.PORT) || 3000,
        logLevel: LogLevel.INFO,
    });
} else {
    console.log("🌐 Starting in HTTP Mode (Multi-tenant)");
    receiver = new ExpressReceiver({
        signingSecret: process.env.SLACK_SIGNING_SECRET || "",
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        stateSecret: "my-state-secret", // TODO: Rotate this
        scopes: ["chat:write", "channels:history", "app_mentions:read", "commands"],
        installationStore: {
            storeInstallation: async (installation) => {
                if (installation.team !== undefined) {
                    await db.saveWorkspace(
                        installation.team.id,
                        installation.team.name || 'Unknown',
                        installation.bot?.token || ''
                    );
                }
                return;
            },
            fetchInstallation: async (installQuery) => {
                if (installQuery.teamId !== undefined) {
                    const workspace = await db.getWorkspace(installQuery.teamId);
                    if (workspace) {
                        return {
                            teamId: workspace.team_id,
                            enterpriseId: undefined,
                            bot: {
                                token: workspace.access_token,
                                userId: workspace.bot_user_id,
                                id: workspace.bot_user_id
                            },
                            user: { token: undefined, id: '' }, // We don't store user tokens for now
                            botUserId: workspace.bot_user_id,
                            tokenType: 'bot',
                        } as any;
                    }
                }
                throw new Error("Failed fetching installation");
            },
            deleteInstallation: async () => { } // Not implemented
        },
    });

    app = new App({
        receiver,
        logLevel: LogLevel.INFO,
    });
}

// Handle Slack URL verification challenge (must return plain text)
// This must be registered BEFORE any other listeners
if (receiver) {
    receiver.router.post('/slack/events', (req: any, res: any, next: any) => {
        if (req.body?.type === 'url_verification') {
            console.log('✅ Responding to Slack url_verification challenge');
            return res.send(req.body.challenge);
        }
        next();
    });
}

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
        await app.start();
        console.log("⚡️ HarmonyAI App is running!");
    })();
}
