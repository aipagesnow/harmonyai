import { receiver } from "../app";

// URL verification challenge echo is implemented below - returns challenge for type: "url_verification"

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
    // Handle Slack URL verification challenge BEFORE Bolt processing
    // Must return pure plain text with Content-Type: text/plain
    if (req.body?.type === 'url_verification') {
        console.log('✅ Slack url_verification challenge received');
        res.setHeader('Content-Type', 'text/plain');
        return res.status(200).send(req.body.challenge);
    }

    try {
        // Bolt's ExpressReceiver handles the request
        await receiver.requestHandler(req, res);
    } catch (error) {
        console.error("Error handling request:", error);
        res.status(500).send("Internal Server Error");
    }
}
