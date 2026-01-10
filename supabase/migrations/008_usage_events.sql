-- Migration: 008_usage_events
-- Purpose: Lightweight monthly usage tracking for plan-based limits.

create extension if not exists "uuid-ossp";

create table if not exists public.usage_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('discovery', 'creative')),
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz default now()
);

create index if not exists idx_usage_events_user_created_at
  on public.usage_events(user_id, created_at desc);

create index if not exists idx_usage_events_user_type_created_at
  on public.usage_events(user_id, event_type, created_at desc);

alter table public.usage_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'usage_events' and policyname = 'Users can view their own usage'
  ) then
    create policy "Users can view their own usage"
      on public.usage_events for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'usage_events' and policyname = 'Users can insert their own usage'
  ) then
    create policy "Users can insert their own usage"
      on public.usage_events for insert
      with check (auth.uid() = user_id);
  end if;
end$$;

