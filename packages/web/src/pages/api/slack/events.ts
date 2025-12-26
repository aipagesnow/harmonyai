import type { NextApiRequest, NextApiResponse } from 'next';
import rawBody from 'raw-body';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Manual raw body for signature verification
    if (req.method === 'POST') {
        const buffer = await rawBody(req);
        (req as any).rawBody = buffer.toString();
    }

    // Dynamically import the receiver from slack-bot (which is already configured with the app)
    const { receiver } = await import('@harmony-ai/slack-bot');

    await receiver.requestListener(req, res);
}

export const config = {
    api: {
        bodyParser: false,
    },
};
