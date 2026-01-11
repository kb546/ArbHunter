import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isAuthConfigured, setAuthCookies } from '@/lib/auth.server';

function safeNext(raw: string | null) {
  const v = raw || '';
  if (!v.startsWith('/')) return '/dashboard';
  if (v.startsWith('//')) return '/dashboard';
  return v;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const nextPath = safeNext(url.searchParams.get('next'));

  // If Supabase sent an error, route to a friendly page.
  const errorCode = url.searchParams.get('error_code') || url.searchParams.get('error');
  if (errorCode) {
    const errUrl = new URL('/auth/confirm/error', url.origin);
    for (const [k, v] of url.searchParams.entries()) errUrl.searchParams.set(k, v);
    if (!errUrl.searchParams.get('next')) errUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(errUrl);
  }

  if (!isAuthConfigured()) {
    return NextResponse.redirect(new URL('/auth/login?error=auth_not_configured', url.origin));
  }

  const code = url.searchParams.get('code');
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type'); // signup, recovery, magiclink, email_change

  const supabase = createSupabaseServerClient();

  try {
    let session: any = null;

    if (code) {
      const { data, error } = await (supabase.auth as any).exchangeCodeForSession(code);
      if (error) throw error;
      session = data?.session || null;
    } else if (token_hash && type) {
      const { data, error } = await (supabase.auth as any).verifyOtp({
        token_hash,
        type,
      });
      if (error) throw error;
      session = data?.session || null;
    }

    if (!session) {
      const errUrl = new URL('/auth/confirm/error', url.origin);
      errUrl.searchParams.set('error_code', 'no_session');
      errUrl.searchParams.set('error_description', 'Email link was invalid or already used. Please request a new link.');
      errUrl.searchParams.set('next', nextPath);
      return NextResponse.redirect(errUrl);
    }

    await setAuthCookies({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
    });

    return NextResponse.redirect(new URL(nextPath, url.origin));
  } catch (e: any) {
    const errUrl = new URL('/auth/confirm/error', url.origin);
    errUrl.searchParams.set('error_code', String(e?.code || 'confirm_failed'));
    errUrl.searchParams.set('error_description', String(e?.message || 'Email link was invalid or expired.'));
    errUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(errUrl);
  }
}

