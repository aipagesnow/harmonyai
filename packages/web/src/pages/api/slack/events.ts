import type { NextApiRequest, NextApiResponse } from 'next';
import { ExpressReceiver } from '@slack/bolt';
import rawBody from 'raw-body';

const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    processBeforeResponse: true,
});

(async () => {
    const { app } = await import('@harmony-ai/slack-bot');
    receiver.app.use(app.getRouter());
})();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const buffer = await rawBody(req);
        (req as any).rawBody = buffer.toString();
        req.headers['content-type'] = 'application/json';
    }

    await receiver.requestListener(req, res);
}

export const config = {
    api: {
        bodyParser: false,
    },
};
