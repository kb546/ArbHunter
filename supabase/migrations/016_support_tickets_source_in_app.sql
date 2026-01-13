-- Migration: 016_support_tickets_source_in_app
-- Purpose: Allow additional source values for support_tickets (e.g., in_app)
-- Created: 2026-01-13

do $$
begin
  -- Drop the existing check constraint if it exists
  if exists (
    select 1
    from pg_constraint
    where conname = 'support_tickets_source_check'
  ) then
    alter table public.support_tickets drop constraint support_tickets_source_check;
  end if;

  -- Recreate with expanded allowed values
  alter table public.support_tickets
    add constraint support_tickets_source_check
    check (source in ('support', 'contact', 'in_app'));
end $$;

