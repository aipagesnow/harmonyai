import type { NextApiRequest, NextApiResponse } from 'next';
import rawBody from 'raw-body';

let botReceiver: any = null;

async function getReceiver() {
    if (!botReceiver) {
        const { receiver } = await import('@harmony-ai/slack-bot');
        botReceiver = receiver;
    }
    return botReceiver;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const buffer = await rawBody(req);
        (req as any).rawBody = buffer.toString();
    }

    const receiver = await getReceiver();

    // Call the underlying Express app directly
    receiver.app(req, res);
}

export const config = {
    api: {
        bodyParser: false,
    },
};
