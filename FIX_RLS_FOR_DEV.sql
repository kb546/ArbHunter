-- ===========================================================================
-- FIX: Disable RLS for Development (Creative Studio MVP)
-- ===========================================================================
-- 
-- This temporarily disables Row Level Security on Creative Studio tables
-- so you can test without authentication.
--
-- IMPORTANT: Re-enable RLS before production launch with real auth!
--
-- ===========================================================================

-- Disable RLS on all Creative Studio tables
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE generated_creatives DISABLE ROW LEVEL SECURITY;
ALTER TABLE generated_copies DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_variations DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_performance DISABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS disabled for Creative Studio tables. You can now create campaigns!';
  RAISE NOTICE 'Remember to re-enable RLS before production launch.';
END $$;


