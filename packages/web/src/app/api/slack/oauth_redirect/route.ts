import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state"); // validation skipped for MVP

    if (error) {
        return NextResponse.json({ error }, { status: 400 });
    }

    if (!code) {
        return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    try {
        // Exchange code for token
        const response = await fetch("https://slack.com/api/oauth.v2.access", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.SLACK_CLIENT_ID || "",
                client_secret: process.env.SLACK_CLIENT_SECRET || "",
                code,
                redirect_uri: process.env.SLACK_REDIRECT_URI || "", // e.g. https://your-domain.com/api/slack/oauth_redirect
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            return NextResponse.json({ error: data.error }, { status: 400 });
        }

        // Store in Supabase
        // table: workspaces (team_id, team_name, access_token, installation_meta)
        const { error: dbError } = await supabase.from("workspaces").upsert(
            {
                team_id: data.team.id,
                team_name: data.team.name,
                access_token: data.access_token,
                bot_user_id: data.bot_user_id,
                installation_meta: data,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "team_id" }
        );

        if (dbError) {
            console.error("DB Error:", dbError);
            return NextResponse.json({ error: "Failed to save installation" }, { status: 500 });
        }

        // Redirect to success page (or dashboard root)
        return NextResponse.redirect(new URL("/?success=true", request.url));
    } catch (err) {
        console.error("OAuth Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
