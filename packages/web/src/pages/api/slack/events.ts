import type { NextApiRequest, NextApiResponse } from 'next';
import { ExpressReceiver } from '@slack/bolt';

const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    processBeforeResponse: true, // Required for serverless
});

(async () => {
    const { app } = await import('@harmony-ai/slack-bot');
    receiver.app.use(app.getRouter()); // app.getRouter() is public
})();

export default receiver.requestListener;

export const config = {
    api: {
        bodyParser: false,
    },
};
