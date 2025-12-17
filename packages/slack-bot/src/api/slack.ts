import { receiver } from "../app";

// URL verification challenge echo is implemented below - returns challenge for type: "url_verification"

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
    try {
        // Bolt's ExpressReceiver handles the request
        await receiver.requestHandler(req, res);
    } catch (error) {
        console.error("Error handling request:", error);
        res.status(500).send("Internal Server Error");
    }
}
