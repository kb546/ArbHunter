import { createClient } from '@supabase/supabase-js';

// Check if Supabase credentials are configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client (will work with mock data if credentials not set)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && supabase !== null;
};

// Helper to warn when Supabase is not configured
export const ensureSupabase = () => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️  Supabase not configured. Using mock data mode.');
    return false;
  }
  return true;
};


