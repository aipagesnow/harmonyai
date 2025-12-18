import { receiver } from "@harmony-ai/slack-bot";
import type { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";

// Disable Next.js body parser to allow Bolt to verify signature
export const config = {
    api: {
        bodyParser: false,
    },
};

/**
 * Helper to read raw body from request stream
 */
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests for events
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // 1. Read the raw body
        // We need this to check for 'url_verification' immediately
        const rawBodyBuffer = await getRawBody(req);
        const rawBody = rawBodyBuffer.toString("utf-8");

        // 2. Handle URL Verification Challenge
        try {
            const body = JSON.parse(rawBody);
            if (body.type === "url_verification") {
                console.log("✅ Responding to Slack url_verification challenge");
                res.setHeader("Content-Type", "text/plain");
                return res.status(200).send(body.challenge);
            }
        } catch (e) {
            // Ignore JSON parse errors, let Bolt handle invalid bodies if it wants
        }

        // 3. Pass to Bolt's Receiver
        // Since we consumed the stream, we must restore it so Bolt's body-parser works
        const newStream = new Readable();
        newStream.push(rawBodyBuffer);
        newStream.push(null);

        // Copy all properties from the original request to the new stream
        Object.assign(newStream, req);

        // Rewrite URL to match Bolt's default endpoint expectation ('/slack/events')
        // Next.js might give us '/api/slack/events'
        if ((newStream as any).url && (newStream as any).url.startsWith('/api/slack/events')) {
            (newStream as any).url = '/slack/events';
        }

        if (!receiver) {
            console.error("Slack receiver is not initialized. Ensure NODE_ENV is production or HTTP mode is enabled.");
            return res.status(500).send("Internal Server Configuration Error");
        }

        // Delegate to Bolt
        await receiver.requestHandler(newStream as any, res as any);
    } catch (error) {
        console.error("Error in Slack events handler:", error);
        res.status(500).send("Internal Server Error");
    }
}
