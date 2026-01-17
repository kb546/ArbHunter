-- Migration 017: Add Dodo Payments Support
-- Description: Adds Dodo Payments provider support to subscriptions table
-- Date: 2026-01-17

-- Add Dodo Payments fields to subscriptions table
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS dodo_customer_id text,
  ADD COLUMN IF NOT EXISTS dodo_subscription_id text,
  ADD COLUMN IF NOT EXISTS dodo_price_id text,
  ADD COLUMN IF NOT EXISTS dodo_transaction_id text,
  ADD COLUMN IF NOT EXISTS provider_metadata jsonb DEFAULT '{}'::jsonb;

-- Update provider constraint to include 'dodo'
-- First, drop the existing constraint from migration 005
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_provider_check;

-- Add the new constraint that includes 'dodo'
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_provider_check
  CHECK (provider IN ('stripe', 'paddle', 'dodo'));

-- Create unique index for Dodo subscription IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_dodo_subscription_id
  ON public.subscriptions(dodo_subscription_id)
  WHERE dodo_subscription_id IS NOT NULL;

-- Update webhook_events provider constraint to include 'dodo'
ALTER TABLE public.webhook_events
  DROP CONSTRAINT IF EXISTS webhook_events_provider_check;

ALTER TABLE public.webhook_events
  ADD CONSTRAINT webhook_events_provider_check
  CHECK (provider IN ('stripe', 'paddle', 'dodo'));

-- Add comment for documentation
COMMENT ON COLUMN public.subscriptions.provider_metadata IS 'Provider-specific data (JSON). Used for storing Dodo-specific fields or metadata that don''t fit in standard columns.';
COMMENT ON COLUMN public.subscriptions.dodo_customer_id IS 'Dodo Payments customer ID';
COMMENT ON COLUMN public.subscriptions.dodo_subscription_id IS 'Dodo Payments subscription ID (unique)';
COMMENT ON COLUMN public.subscriptions.dodo_price_id IS 'Dodo Payments price/product ID';
COMMENT ON COLUMN public.subscriptions.dodo_transaction_id IS 'Dodo Payments initial transaction ID';
