import type { NextApiRequest, NextApiResponse } from 'next';
import rawBody from 'raw-body';

let boltApp: any = null;

async function getBoltApp() {
    if (!boltApp) {
        const { app } = await import('@harmony-ai/slack-bot');
        boltApp = app;
    }
    return boltApp;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Manual raw body reading to bypass Next.js parsing and ensure correct signature
        const buf = await rawBody(req);
        const raw = buf.toString();

        // Bolt needs BOTH:
        // 1. .rawBody (string) for signature verification
        // 2. .body (object) for event routing/types
        (req as any).rawBody = raw;
        (req as any).body = JSON.parse(raw);
    }

    const app = await getBoltApp();

    try {
        // app.processEvent calls the underlying receiver's requestListener
        // This works because we've set up req.rawBody and req.body correctly above
        await app.processEvent(req, res);
    } catch (error) {
        console.error('Error processing Slack event:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

// Disable Next.js body parsing (required for rawBody to work)
export const config = {
    api: {
        bodyParser: false,
    },
};
