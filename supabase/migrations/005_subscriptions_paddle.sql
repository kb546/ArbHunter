-- Migration: 005_subscriptions_paddle
-- Purpose: Extend subscriptions table to support Paddle (Merchant of Record)
-- Created: 2026-01-09

alter table public.subscriptions
  add column if not exists provider text not null default 'stripe' check (provider in ('stripe', 'paddle'));

alter table public.subscriptions
  add column if not exists paddle_customer_id text,
  add column if not exists paddle_subscription_id text,
  add column if not exists paddle_price_id text,
  add column if not exists paddle_transaction_id text;

-- Ensure we don't accidentally store both providers' subscription IDs on the same record.
-- We'll rely on provider-specific IDs + unique constraints.
create unique index if not exists idx_subscriptions_paddle_subscription_id
  on public.subscriptions(paddle_subscription_id)
  where paddle_subscription_id is not null;

create unique index if not exists idx_subscriptions_stripe_subscription_id
  on public.subscriptions(stripe_subscription_id)
  where stripe_subscription_id is not null;

