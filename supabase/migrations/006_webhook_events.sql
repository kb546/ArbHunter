-- Create a lightweight webhook event log for debugging/verification (no raw payload storage).
-- This table is intended to be read by a server-rendered admin page using the service role key.

create table if not exists public.webhook_events (
  id uuid primary key default uuid_generate_v4(),
  provider text not null check (provider in ('paddle', 'stripe')),
  event_type text not null,
  event_id text,
  status text not null check (status in ('received', 'processed', 'ignored', 'error')),
  http_status integer,
  signature_present boolean default false,
  verified boolean default false,
  verify_reason text,
  process_error text,
  related_user_id uuid,
  related_subscription_id text,
  related_transaction_id text,
  created_at timestamptz default now()
);

create index if not exists idx_webhook_events_provider_created_at
  on public.webhook_events(provider, created_at desc);

create index if not exists idx_webhook_events_event_id
  on public.webhook_events(event_id);

-- Lock down: only service role should access this table in production.
alter table public.webhook_events enable row level security;

-- No policies by default (service role bypasses RLS).

