-- ============================================================================
-- FIX: Foreign Key Constraint Error for Creative Studio MVP
-- ============================================================================
-- Error: "insert or update on table \"campaigns\" violates foreign key 
--         constraint \"campaigns_user_id_fkey\""
--
-- Root Cause: The campaigns table has a foreign key to auth.users, but the
--             demo UUID doesn't exist in auth.users yet.
--
-- Solution: Choose ONE of the options below
-- ============================================================================

-- ============================================================================
-- OPTION 1: CREATE A DEMO USER (RECOMMENDED FOR MVP)
-- ============================================================================
-- This creates a valid demo user in auth.users that matches our UUID
-- Run this in Supabase SQL Editor:

-- First, check if the demo user already exists
DO $$
BEGIN
  -- Insert demo user if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at,
      confirmation_token,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000000',
      'demo@arbhunter.com',
      crypt('demo-password-12345', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Demo User"}'::jsonb,
      'authenticated',
      'authenticated',
      NOW(),
      NOW(),
      '',
      '',
      ''
    );
    
    RAISE NOTICE 'Demo user created successfully!';
  ELSE
    RAISE NOTICE 'Demo user already exists.';
  END IF;
END $$;

-- Verify the demo user was created
SELECT id, email, created_at FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================================================
-- OPTION 2: REMOVE FOREIGN KEY CONSTRAINT (QUICK BUT LESS SAFE)
-- ============================================================================
-- This removes the foreign key constraint entirely
-- Only use this if Option 1 doesn't work
-- Run this in Supabase SQL Editor:

-- ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_user_id_fkey;
-- ALTER TABLE generated_creatives DROP CONSTRAINT IF EXISTS generated_creatives_campaign_id_fkey CASCADE;
-- ALTER TABLE generated_copies DROP CONSTRAINT IF EXISTS generated_copies_campaign_id_fkey CASCADE;

-- ============================================================================
-- VERIFY THE FIX
-- ============================================================================
-- After running Option 1, verify everything works:

-- Check if demo user exists
SELECT 
  'Demo User Status:' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001')
    THEN '✅ Demo user exists'
    ELSE '❌ Demo user NOT found'
  END as status;

-- Check if campaigns table is ready
SELECT 
  'Campaigns Table Status:' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns')
    THEN '✅ Campaigns table exists'
    ELSE '❌ Campaigns table NOT found'
  END as status;

-- Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('campaigns', 'generated_creatives', 'generated_copies')
  AND schemaname = 'public';

-- ============================================================================
-- AFTER RUNNING THIS:
-- ============================================================================
-- 1. Refresh your browser: http://localhost:3000/creative-studio
-- 2. Try creating a campaign
-- 3. It should work! ✅
-- ============================================================================


