# HarmonyAI - Test deploy successful (December 17, 2025)

# HarmonyAI

Privacy-first, AI-powered workplace conflict prevention agent for Slack.

## Deployment

### Vercel (Recommended)
This project is configured for Vercel deployment.

1.  **Install Vercel CLI**: `npm i -g vercel`
2.  **Deploy**: Run `vercel` in the `HarmonyAI` directory.
3.  **Environment Variables**: Add the following to your Vercel project settings:
    -   `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_APP_TOKEN`
    -   `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`
    -   `GEMINI_API_KEY`
    -   `SUPABASE_URL`, `SUPABASE_KEY`
4.  **Slack Config**: Update your Slack App "Interactivity" and "Event Subscriptions" Request URL to your Vercel URL (e.g., `https://your-project.vercel.app/api/slack/events`).

### Local Development
1.  `npm install`
2.  Copy `.env.example` to `.env` and fill in credentials.
3.  `npm start` (Runs in Socket Mode for local dev)

## Project Structure
- `packages/slack-bot`: The main bot application.
- `packages/web`: Next.js dashboard (optional).
- `packages/shared`: Shared types and utilities.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` in the root (or specific packages if preferred, but root is easier for monorepo dev).
   ```bash
   cp .env.example .env
   ```
   Fill in your tokens:
   - **Slack**: Create an app at [api.slack.com](https://api.slack.com).
     - Enable **Socket Mode** (or use ngrok).
     - Scopes: `chat:write`, `channels:history`, `app_mentions:read`, `commands`.
     - Install to workspace to get `SLACK_BOT_TOKEN`.
   - **Gemini**: Get an API key from Google AI Studio.

3. **Run Locally**

   **Slack Bot**:
   ```bash
   npm run dev --workspace=@harmony-ai/slack-bot
   ```

   **Web Dashboard**:
   ```bash
   npm run dev --workspace=@harmony-ai/web
   ```

## Features

- **Sentiment Analysis**: Analyzes public channel messages for negative sentiment and friction using Gemini Pro.
- **Privacy First**: No raw text is stored. Only aggregated scores.
- **Slash Commands**: `/harmony pulse` to check channel health.
- **Admin Alerts**: Logs potential friction to console (extendable to DMs).

## Testing

Run unit tests:
```bash
npm run test --workspace=@harmony-ai/slack-bot
```
