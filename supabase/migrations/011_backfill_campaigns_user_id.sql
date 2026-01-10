-- Migration: 011_backfill_campaigns_user_id
-- Purpose: Backfill legacy campaigns.user_id from linked discoveries.user_id (fixes "missing campaigns" under RLS).
-- Safe: only updates campaigns where user_id is NULL and discovery_id is present.

do $$
begin
  -- campaigns created from discoveries can be reliably mapped
  update public.campaigns c
  set user_id = d.user_id
  from public.discoveries d
  where c.user_id is null
    and c.discovery_id is not null
    and d.id = c.discovery_id
    and d.user_id is not null;
end $$;

