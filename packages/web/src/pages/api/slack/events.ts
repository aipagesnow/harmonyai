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
        const buf = await rawBody(req);
        const raw = buf.toString();

        (req as any).rawBody = raw;

        if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
            // Parse URL-encoded body (Slash Commands)
            const querystring = require('querystring');
            (req as any).body = querystring.parse(raw);
            console.log('DEBUG: Parsed form-urlencoded body keys:', Object.keys((req as any).body));
        } else {
            // Parse JSON body (Events API)
            (req as any).body = JSON.parse(raw);
            console.log('DEBUG: Parsed JSON body keys:', Object.keys((req as any).body));
        }
        console.log('DEBUG: Content-Type:', req.headers['content-type']);
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
