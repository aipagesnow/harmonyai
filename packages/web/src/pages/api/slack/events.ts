import { HTTPReceiver } from '@slack/bolt';
import type { NextApiRequest, NextApiResponse } from 'next';

// Create the HTTPReceiver (official for serverless environments like Vercel)
const receiver = new HTTPReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    processBeforeResponse: true, // Required for serverless
});

// Dynamically attach your existing Bolt app's router
(async () => {
    const { app } = await import('@harmony-ai/slack-bot');
    // @ts-ignore - Assuming app has a router property or we might need to adjust this
    if (app.router) {
        // @ts-ignore
        receiver.app.use(app.router);
    } else if (app.receiver && (app.receiver as any).router) {
        // Fallback for standard ExpressReceiver usage within Bolt App
        // @ts-ignore
        receiver.app.use((app.receiver as any).router);
    }
})();

// Export the receiver's request listener as the default handler
export default receiver.requestListener;

// Disable Next.js body parsing — critical for Slack signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};
