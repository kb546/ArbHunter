-- Migration: 004_subscriptions
-- Purpose: Track Stripe subscriptions per user (for usage limits + gating)
-- Created: 2026-01-09

create extension if not exists "uuid-ossp";

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,

  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'agency')),
  status text not null default 'inactive' check (status in ('active', 'trialing', 'past_due', 'canceled', 'inactive')),

  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

-- updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_subscriptions_updated_at on public.subscriptions;
create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.update_updated_at_column();

-- RLS
alter table public.subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'subscriptions' and policyname = 'Users can view their own subscription'
  ) then
    create policy "Users can view their own subscription"
      on public.subscriptions for select
      using (auth.uid() = user_id);
  end if;
end$$;

