import { HTTPReceiver } from '@slack/bolt';
import type { NextApiRequest, NextApiResponse } from 'next';

// Create the HTTPReceiver (official for serverless)
const receiver = new HTTPReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    processBeforeResponse: true, // Required for serverless
});

// Dynamically attach the public app.router
(async () => {
    const { app } = await import('@harmony-ai/slack-bot');
    receiver.app.use(app.router); // app.router is public
})();

// Export the receiver's request listener
export default receiver.requestListener;

// Disable Next.js body parsing (required for signature verification)
export const config = {
    api: {
        bodyParser: false,
    },
};
