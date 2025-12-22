import type { NextApiRequest, NextApiResponse } from 'next';

let boltApp: any = null;

async function getBoltApp() {
    if (!boltApp) {
        const { app } = await import('@harmony-ai/slack-bot');
        boltApp = app;
    }
    return boltApp;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const app = await getBoltApp();

    try {
        // Public method: handles signature verification, parsing, and routing
        await app.processEvent(req, res);
    } catch (error) {
        console.error('Error processing Slack event:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

// Required for Slack signature verification (raw body)
export const config = {
    api: {
        bodyParser: false,
    },
};
