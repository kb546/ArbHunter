'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient, setAuthCookies, clearAuthCookies, isAuthConfigured } from '@/lib/auth.server';

function safeNextPath(raw: unknown) {
  const v = typeof raw === 'string' ? raw : '';
  if (!v.startsWith('/')) return '/';
  if (v.startsWith('//')) return '/';
  return v;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const nextPath = safeNextPath(formData.get('next'));

  if (!isAuthConfigured()) {
    return { error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' };
  }
  if (!email || !password) return { error: 'Email and password are required.' };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };
  if (!data.session) return { error: 'Login succeeded but no session was returned. Check your Supabase Auth settings.' };

  await setAuthCookies({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
  });

  redirect(nextPath);
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const nextPath = safeNextPath(formData.get('next'));

  if (!isAuthConfigured()) {
    return { error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' };
  }
  if (!email || !password) return { error: 'Email and password are required.' };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message };

  // If email confirmations are enabled, session may be null.
  if (!data.session) {
    redirect(`/auth/check-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(nextPath)}`);
  }

  await setAuthCookies({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
  });

  redirect(nextPath);
}

export async function logoutAction() {
  // We clear cookies regardless of Supabase state
  await clearAuthCookies();
  redirect('/auth/login');
}

