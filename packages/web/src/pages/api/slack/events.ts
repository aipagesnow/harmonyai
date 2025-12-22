import type { NextApiRequest, NextApiResponse } from 'next';
import { ExpressReceiver } from '@slack/bolt';
import rawBody from 'raw-body';

const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    processBeforeResponse: true, // Required for serverless
});

(async () => {
    const { app } = await import('@harmony-ai/slack-bot');
    // Cast to any to bypass 'private property' TS checks
    const boltApp = app as any;

    if (boltApp.getRouter) {
        receiver.app.use(boltApp.getRouter());
    } else if (boltApp.receiver && boltApp.receiver.app) {
        receiver.app.use(boltApp.receiver.app);
    }
})();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Manual raw body reading to bypass Next.js parsing and ensure correct signature
        const buf = await rawBody(req);
        (req as any).rawBody = buf.toString(); // Bolt uses this for signature verification if present
        (req as any).body = JSON.parse(buf.toString()); // Bolt uses this for event dispatch/routing
    }

    // ExpressReceiver exposes the express app as 'app'
    await receiver.app(req as any, res as any);
}

export const config = {
    api: {
        bodyParser: false,
    },
};
