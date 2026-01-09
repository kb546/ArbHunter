-- Migration: 003_discoveries_user_rls
-- Purpose: Make discoveries multi-tenant (per-user) using auth + RLS
-- Created: 2026-01-09

-- Ensure uuid extension exists (may already be enabled)
create extension if not exists "uuid-ossp";

-- 1) Add user_id to discoveries (nullable for legacy rows)
alter table public.discoveries
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists idx_discoveries_user_id on public.discoveries(user_id);

-- 2) Enable RLS
alter table public.discoveries enable row level security;

-- 3) Policies
do $$
begin
  -- SELECT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'discoveries' and policyname = 'Users can view their own discoveries'
  ) then
    create policy "Users can view their own discoveries"
      on public.discoveries for select
      using (auth.uid() = user_id);
  end if;

  -- INSERT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'discoveries' and policyname = 'Users can create their own discoveries'
  ) then
    create policy "Users can create their own discoveries"
      on public.discoveries for insert
      with check (auth.uid() = user_id);
  end if;

  -- UPDATE
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'discoveries' and policyname = 'Users can update their own discoveries'
  ) then
    create policy "Users can update their own discoveries"
      on public.discoveries for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  -- DELETE
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'discoveries' and policyname = 'Users can delete their own discoveries'
  ) then
    create policy "Users can delete their own discoveries"
      on public.discoveries for delete
      using (auth.uid() = user_id);
  end if;
end$$;

