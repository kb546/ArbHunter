-- Migration: 010_campaign_winner_fields
-- Purpose: Persist selected winner variation per campaign.

alter table public.campaigns
  add column if not exists winner_variation_id uuid references public.campaign_variations(id) on delete set null,
  add column if not exists winner_selected_at timestamptz;

create index if not exists idx_campaigns_winner_variation_id
  on public.campaigns(winner_variation_id);

