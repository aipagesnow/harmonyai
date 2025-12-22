// import { receiver } from "@harmony-ai/slack-bot"; // Dynamically imported
import type { NextApiRequest, NextApiResponse } from "next";

// Disable Next.js body parser to allow Bolt to verify signature
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests for events
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { app } = await import("@harmony-ai/slack-bot");

        if (!app) {
            console.error("Slack app is not initialized.");
            return res.status(500).send("Internal Server Configuration Error");
        }

        // Use the public processEvent method (handles verification + routing)
        await app.processEvent(req, res);
    } catch (error) {
        console.error("Error in Slack events handler:", error);
        res.status(500).send("Internal Server Error");
    }
}
