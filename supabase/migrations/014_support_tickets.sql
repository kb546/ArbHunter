-- Migration: 014_support_tickets
-- Purpose: Store support requests submitted from in-app contact form
-- Created: 2026-01-11

create extension if not exists "uuid-ossp";

create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  subject text not null,
  message text not null,
  page_url text,
  user_agent text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz default now()
);

create index if not exists idx_support_tickets_created_at on public.support_tickets(created_at desc);
create index if not exists idx_support_tickets_user_id on public.support_tickets(user_id);

alter table public.support_tickets enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'support_tickets' and policyname = 'Users can create support tickets'
  ) then
    create policy "Users can create support tickets"
      on public.support_tickets for insert
      with check (auth.uid() = user_id or user_id is null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'support_tickets' and policyname = 'Users can view their own support tickets'
  ) then
    create policy "Users can view their own support tickets"
      on public.support_tickets for select
      using (auth.uid() = user_id);
  end if;
end$$;

