import type { NextApiRequest, NextApiResponse } from 'next';
import { ExpressReceiver } from '@slack/bolt';
import rawBody from 'raw-body';

const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    processBeforeResponse: true, // Required for serverless
});

(async () => {
    const { app } = await import('@harmony-ai/slack-bot');
    // Use processEvent in middleware to route events to your app's listeners
    receiver.app.use(async (req, res, next) => {
        try {
            await app.processEvent(req, res);
        } catch (error) {
            next(error);
        }
    });
})();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const buffer = await rawBody(req);
        (req as any).rawBody = buffer.toString();
    }

    await receiver.requestListener(req, res);
}

export const config = {
    api: {
        bodyParser: false,
    },
};
