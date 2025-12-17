import { receiver } from "../app";

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
    try {
        // Handle Slack URL verification challenge
        // Slack sends this when setting up Event Subscriptions
        if (req.body && req.body.type === "url_verification") {
            console.log("✅ Responding to URL verification challenge");
            return res.status(200).json({ challenge: req.body.challenge });
        }

        // For all other events, let Bolt's ExpressReceiver handle the request
        // This includes slash commands (/harmony, /harmony-pulse) and message events
        await receiver.requestHandler(req, res);
    } catch (error) {
        console.error("Error handling request:", error);
        res.status(500).send("Internal Server Error");
    }
}
