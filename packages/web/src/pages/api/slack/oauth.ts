import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    const { code } = req.query;

    if (!code) {
        console.error('No code in OAuth callback');
        return res.status(400).send('Invalid request');
    }

    try {
        // Exchange code for access_token
        const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
            params: {
                code,
                client_id: process.env.SLACK_CLIENT_ID,
                client_secret: process.env.SLACK_CLIENT_SECRET,
                redirect_uri: 'https://harmonyai-web.vercel.app/api/slack/oauth',
            },
        });

        const data = response.data;

        if (!data.ok) {
            console.error('Slack OAuth failed:', data.error);
            return res.status(500).send('OAuth failed');
        }

        const { team, bot_user_id, access_token } = data;

        // Store in Supabase
        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        await supabase.from('workspaces').upsert({
            team_id: team.id,
            team_name: team.name,
            access_token,
            bot_user_id,
            installation_meta: data,
        }, { onConflict: 'team_id' });

        // Redirect back to dashboard
        res.redirect(302, '/');
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).send('Internal Server Error');
    }
}
