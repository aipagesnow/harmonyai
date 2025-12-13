-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Workspaces: Stores Slack installation data
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  team_id text not null unique,
  team_name text,
  access_token text not null, -- Encrypt in real prod, store raw for MVP demo
  bot_user_id text,
  installation_meta jsonb, -- Stores full Slack install payload
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Subscriptions: Linked to workspaces
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  stripe_customer_id text,
  plan_id text default 'free', -- free, pro, team
  status text default 'active',
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(workspace_id)
);

-- Channels: Stores channel-specific settings
create table public.channels (
  id uuid default uuid_generate_v4() primary key,
  channel_id text not null,
  team_id text not null, -- Slack Team ID, not workspace UUID, for easier lookup
  name text,
  settings jsonb default '{"alert_threshold": -0.5, "admin_alerts": true}',
  created_at timestamp with time zone default now(),
  unique(channel_id, team_id)
);

-- Sentiment Logs: Aggregated metrics. NO RAW TEXT.
create table public.sentiment_logs (
  id uuid default uuid_generate_v4() primary key,
  channel_id text not null,
  team_id text not null,
  sentiment_score float not null, -- The individual message score
  friction_detected boolean default false,
  message_ts text, -- Timestamp of message for ordering
  created_at timestamp with time zone default now()
);

-- Indexes
create index idx_workspaces_team_id on public.workspaces(team_id);
create index idx_sentiment_logs_channel_id on public.sentiment_logs(channel_id);
create index idx_sentiment_logs_created_at on public.sentiment_logs(created_at);
