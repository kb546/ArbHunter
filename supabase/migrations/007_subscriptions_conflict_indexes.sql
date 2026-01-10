-- Migration: 007_subscriptions_conflict_indexes
-- Purpose: Ensure `upsert(..., { onConflict: 'paddle_subscription_id' })` works in Postgres/Supabase.
-- The previous partial unique index (WHERE paddle_subscription_id is not null) cannot be used by
-- `ON CONFLICT (paddle_subscription_id)` inference, so webhook upserts fail.

-- Drop partial unique indexes (if they exist)
drop index if exists public.idx_subscriptions_paddle_subscription_id;
drop index if exists public.idx_subscriptions_stripe_subscription_id;

-- Create a non-partial unique index for Paddle subscription IDs.
-- Postgres UNIQUE allows multiple NULLs, so this does not block rows with null paddle_subscription_id.
create unique index if not exists uniq_subscriptions_paddle_subscription_id
  on public.subscriptions(paddle_subscription_id);

