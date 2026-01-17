import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';

export type BillingAccess =
  | { ok: true; plan: 'starter' | 'pro' | 'agency' | 'free'; status: 'active' | 'trialing' }
  | { ok: false; reason: 'unauthenticated' | 'not_subscribed' | 'inactive'; status?: string | null; plan?: string | null };

export type SubscriptionRow = {
  provider: 'stripe' | 'paddle' | 'dodo';
  plan: 'free' | 'starter' | 'pro' | 'agency';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  paddle_customer_id: string | null;
  paddle_subscription_id: string | null;
  paddle_price_id: string | null;
  paddle_transaction_id: string | null;
  dodo_customer_id?: string | null;
  dodo_subscription_id?: string | null;
  dodo_price_id?: string | null;
  dodo_transaction_id?: string | null;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * Returns the latest subscription row for the user (via RLS) or null.
 * Use this for UI display; it does NOT imply access.
 */
export async function getUserSubscription(): Promise<SubscriptionRow | null> {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user || !session.accessToken) return null;

  const supabase = createSupabaseAuthedServerClient(session.accessToken);
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      'provider,plan,status,current_period_start,current_period_end,cancel_at_period_end,paddle_customer_id,paddle_subscription_id,paddle_price_id,paddle_transaction_id,dodo_customer_id,dodo_subscription_id,dodo_price_id,dodo_transaction_id,created_at,updated_at'
    )
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as any;
}

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

  // Safety net:
  // If the subscription row says inactive but the current period end is in the future,
  // treat it as trialing/active. This protects users if a webhook briefly wrote a wrong status.
  const end = data.current_period_end ? new Date(data.current_period_end).getTime() : null;
  if (plan !== 'free' && end && end > Date.now()) {
    return { ok: true, plan: plan as any, status: 'trialing' };
  }

  return { ok: false, reason: 'inactive', status, plan };
}

