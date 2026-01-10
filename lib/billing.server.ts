import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';

export type BillingAccess =
  | { ok: true; plan: 'starter' | 'pro' | 'agency' | 'free'; status: 'active' | 'trialing' }
  | { ok: false; reason: 'unauthenticated' | 'not_subscribed' | 'inactive'; status?: string | null; plan?: string | null };

/**
 * Server-side billing gate.
 * Uses the user's JWT (cookies) -> Supabase RLS to read their `public.subscriptions` row.
 */
export async function getBillingAccess(): Promise<BillingAccess> {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user || !session.accessToken) return { ok: false, reason: 'unauthenticated' };

  const supabase = createSupabaseAuthedServerClient(session.accessToken);
  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan,status,provider,current_period_end,updated_at')
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // If RLS blocks or table missing, treat as not subscribed.
    return { ok: false, reason: 'not_subscribed', status: null, plan: null };
  }

  if (!data) return { ok: false, reason: 'not_subscribed', status: null, plan: null };

  const status = String(data.status || '').toLowerCase();
  const plan = String(data.plan || 'free').toLowerCase();

  if (status === 'trialing' || status === 'active') {
    return { ok: true, plan: plan as any, status: status as any };
  }

  return { ok: false, reason: 'inactive', status, plan };
}

