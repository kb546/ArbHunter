-- Migration: 015_support_tickets_meta
-- Purpose: Support both authenticated support tickets and public contact requests
-- Created: 2026-01-11

alter table public.support_tickets
  add column if not exists source text not null default 'support' check (source in ('support', 'contact')),
  add column if not exists meta jsonb;

create index if not exists idx_support_tickets_source on public.support_tickets(source);

