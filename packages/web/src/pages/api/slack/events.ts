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
    // Manual raw body reading to guarantee correct payload for signature verification
    if (req.method === 'POST') {
        const buffer = await rawBody(req);
        (req as any).body = buffer.toString();
    }

    const app = await getBoltApp();

    try {
        await app.processEvent(req, res);
    } catch (error) {
        console.error('Error processing Slack event:', error);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
}

// Disable Next.js body parsing (required for rawBody to work)
export const config = {
    api: {
        bodyParser: false,
    },
};
