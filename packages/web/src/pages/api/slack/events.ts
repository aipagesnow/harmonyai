import type { NextApiRequest, NextApiResponse } from 'next';
import { ExpressReceiver } from '@slack/bolt';

let receiver: ExpressReceiver | undefined;

// Lazy init to avoid issues if env vars missing
async function getReceiver(): Promise<ExpressReceiver> {
    if (!receiver) {
        const { app } = await import('@harmony-ai/slack-bot');
        receiver = new ExpressReceiver({
            signingSecret: process.env.SLACK_SIGNING_SECRET!,
            processBeforeResponse: true, // crucial for serverless
        });
        // Attach the existing app's router to the receiver
        // Note: getRouter() is not standard in Bolt App, so we access the underlying receiver directly
        // Casting app to any to access the receiver property which holds the ExpressReceiver
        // @ts-ignore
        const botReceiver = app.receiver;
        if (botReceiver && botReceiver.app) {
            // @ts-ignore - Express app types might mismatch slightly, but they are compatible
            receiver.app.use(botReceiver.app);
        }
    }
    return receiver;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const rec = await getReceiver();
        // Use the express app instance directly as the request listener
        rec.app(req as any, res as any);
    } catch (error) {
        console.error('Error in Slack events handler:', error);
        res.status(500).send('Internal Server Error');
    }
}

// Disable Next.js body parsing (Bolt needs raw body for signature verification)
export const config = {
    api: {
        bodyParser: false,
    },
};
