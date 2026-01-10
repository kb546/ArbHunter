-- Migration: 009_campaign_variations_favorites_tags
-- Purpose: Add favorites + tags to campaign variations for Campaigns MVP.

alter table public.campaign_variations
  add column if not exists is_favorite boolean default false,
  add column if not exists tags text[] default '{}';

create index if not exists idx_campaign_variations_is_favorite
  on public.campaign_variations(is_favorite)
  where is_favorite = true;

