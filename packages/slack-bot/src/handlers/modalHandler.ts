import { App } from "@slack/bolt";
import { db } from "../services/database";

export function registerModalHandlers(app: App) {
    // Open Modal Command or Action
    app.action("open_settings", async ({ ack, body, client }) => {
        await ack();
        try {
            await client.views.open({
                trigger_id: (body as any).trigger_id, // Cast for simplicity in MVP
                view: {
                    type: "modal",
                    callback_id: "settings_modal",
                    title: {
                        type: "plain_text",
                        text: "HarmonyAI Settings",
                    },
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: "*Notification Settings*",
                            },
                        },
                        {
                            type: "input",
                            block_id: "threshold_block",
                            label: {
                                type: "plain_text",
                                text: "Alert Threshold (-1.0 to 1.0)",
                            },
                            element: {
                                type: "plain_text_input",
                                action_id: "threshold_input",
                                initial_value: "-0.5"
                            }
                        }
                    ],
                    submit: {
                        type: "plain_text",
                        text: "Save",
                    },
                },
            });
        } catch (error) {
            console.error(error);
        }
    });

    // Handle Submission
    app.view("settings_modal", async ({ ack, view, body, logger }) => {
        await ack();
        const threshold = view.state.values.threshold_block.threshold_input.value;
        const teamId = body.team?.id;

        logger.info(`Settings updated for team ${teamId}: Threshold ${threshold}`);

        // In real app, save to 'channels' or 'workspaces' table via db service
        // await db.updateSettings(teamId, { threshold });
    });
}
