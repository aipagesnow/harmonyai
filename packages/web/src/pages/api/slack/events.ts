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
        const buffer = await rawBody(req);

        // Raw string for signature verification
        (req as any).rawBody = buffer.toString();

        // Parsed object for event.type and command parsing
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
            (req as any).body = JSON.parse(buffer.toString());
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const params = new URLSearchParams(buffer.toString());
            (req as any).body = Object.fromEntries(params);
        } else {
            console.error('Unsupported Content-Type:', contentType);
            return res.status(400).send('Unsupported Content-Type');
        }
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

export const config = {
    api: {
        bodyParser: false,
    },
};
