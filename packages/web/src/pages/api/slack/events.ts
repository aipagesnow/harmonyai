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
        await app.processEvent(req, res);
    } catch (error) {
        console.error('Error processing Slack event:', error);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
}

// Critical: disable Next.js body parsing for Slack signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};
