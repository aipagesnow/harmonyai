import { App } from "@slack/bolt";

export function registerEventHandlers(app: App) {
    app.event("app_home_opened", async ({ event, client, logger }) => {
        try {
            await client.views.publish({
                user_id: event.user,
                view: {
                    type: "home",
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: "*Welcome to HarmonyAI!* 🌿\nI'm here to help your team maintain a positive and productive environment.",
                            },
                        },
                        {
                            type: "divider",
                        },
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: "*Quick Start:*\n• Invite me to a channel to start monitoring.\n• Use `/harmony pulse` to see channel vibes.\n• Use `/harmony forecast` for weekly predictions.",
                            },
                        },
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: "🔒 *Privacy First*: I only process messages in channels I'm invited to. No raw text is ever stored."
                            }
                        }
                    ],
                },
            });
        } catch (error) {
            logger.error(error);
        }
    });

    app.event("member_joined_channel", async ({ event, say }) => {
        // Small greeting when bot joins, or when user joins?
        // "event.user" is the user who joined.
        // If event.user is the bot, we say hello.
        // We need to check if we are the bot, but that requires calling auth.test.
        // For simplicity, we skip complex check for MVP.
    });
}
