-- Migration: 012_user_onboarding
-- Purpose: Track onboarding checklist + guided tour per user
-- Created: 2026-01-11

create table if not exists public.user_onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  checklist jsonb not null default '{}'::jsonb,
  tour jsonb not null default '{}'::jsonb,
  dismissed boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_user_onboarding_user_id on public.user_onboarding(user_id);

-- updated_at trigger (reuses public.update_updated_at_column() from earlier migrations)
drop trigger if exists update_user_onboarding_updated_at on public.user_onboarding;
create trigger update_user_onboarding_updated_at
  before update on public.user_onboarding
  for each row
  execute function public.update_updated_at_column();

-- RLS
alter table public.user_onboarding enable row level security;

do $$
begin
  -- SELECT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_onboarding' and policyname = 'Users can view their own onboarding'
  ) then
    create policy "Users can view their own onboarding"
      on public.user_onboarding for select
      using (auth.uid() = user_id);
  end if;

  -- INSERT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_onboarding' and policyname = 'Users can create their own onboarding'
  ) then
    create policy "Users can create their own onboarding"
      on public.user_onboarding for insert
      with check (auth.uid() = user_id);
  end if;

  -- UPDATE
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_onboarding' and policyname = 'Users can update their own onboarding'
  ) then
    create policy "Users can update their own onboarding"
      on public.user_onboarding for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

