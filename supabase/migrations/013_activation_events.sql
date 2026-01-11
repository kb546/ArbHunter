-- Migration: 013_activation_events
-- Purpose: Track activation funnel events (signup → discovery → creatives → campaign → export)
-- Created: 2026-01-11

create extension if not exists "uuid-ossp";

create table if not exists public.activation_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_activation_events_user_id_created_at
  on public.activation_events(user_id, created_at desc);

alter table public.activation_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'activation_events' and policyname = 'Users can insert their own activation events'
  ) then
    create policy "Users can insert their own activation events"
      on public.activation_events for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'activation_events' and policyname = 'Users can view their own activation events'
  ) then
    create policy "Users can view their own activation events"
      on public.activation_events for select
      using (auth.uid() = user_id);
  end if;
end$$;

