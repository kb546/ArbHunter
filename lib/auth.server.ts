import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const ACCESS_COOKIE = 'sb-access-token';
const REFRESH_COOKIE = 'sb-refresh-token';

export function isAuthConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function createSupabaseServerClient() {
  if (!isAuthConfigured()) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function setAuthCookies(session: { access_token: string; refresh_token: string; expires_in?: number }) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === 'production';
  const maxAge = session.expires_in ? Math.max(60, session.expires_in) : 60 * 60;

  cookieStore.set(ACCESS_COOKIE, session.access_token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  // Refresh token typically long-lived; set a conservative maxAge (30 days).
  cookieStore.set(REFRESH_COOKIE, session.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  cookieStore.set(REFRESH_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export async function getUserFromCookies() {
  if (!isAuthConfigured()) return null;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  const supabase = createSupabaseServerClient();

  // Verify token by asking Supabase for the user for this JWT
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) return null;
  return data.user ?? null;
}

export async function getAccessTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value || null;
}

export async function getRefreshTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value || null;
}

/**
 * Returns a valid (possibly refreshed) access token + user, or null if unauth.
 * Uses sb-refresh-token to refresh when sb-access-token is expired/invalid.
 */
export async function getAuthedSessionFromCookies(): Promise<{ user: any; accessToken: string } | null> {
  if (!isAuthConfigured()) return null;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value || null;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value || null;
  if (!accessToken && !refreshToken) return null;

  const supabase = createSupabaseServerClient();

  // 1) Try current access token first
  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (!error && data.user) return { user: data.user, accessToken };
  }

  // 2) Refresh if possible
  if (!refreshToken) return null;

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (refreshError || !refreshed.session) return null;

  await setAuthCookies({
    access_token: refreshed.session.access_token,
    refresh_token: refreshed.session.refresh_token,
    expires_in: refreshed.session.expires_in,
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser(refreshed.session.access_token);
  if (userErr || !userData.user) return null;

  return { user: userData.user, accessToken: refreshed.session.access_token };
}


