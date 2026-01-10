import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { getUserSubscription } from '@/lib/billing.server';

export type PlanKey = 'free' | 'starter' | 'pro' | 'agency';
export type UsageType = 'discovery' | 'creative';

export type PlanLimits = {
  discoveriesPerMonth: number | null; // null = unlimited
  creativesPerMonth: number | null; // null = unlimited
};

export const PLAN_LIMITS: Record<PlanKey, PlanLimits> = {
  free: { discoveriesPerMonth: 10, creativesPerMonth: 0 },
  starter: { discoveriesPerMonth: 50, creativesPerMonth: 100 },
  pro: { discoveriesPerMonth: 200, creativesPerMonth: 500 },
  agency: { discoveriesPerMonth: null, creativesPerMonth: 2000 },
};

function startOfCurrentMonthISO() {
  const d = new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
  return start.toISOString();
}

export async function getCurrentPlanKey(): Promise<PlanKey> {
  const sub = await getUserSubscription();
  if (!sub?.plan) return 'free';
  return (sub.plan || 'free') as PlanKey;
}

export async function getMonthlyUsage(): Promise<{ discoveries: number; creatives: number }> {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user || !session.accessToken) return { discoveries: 0, creatives: 0 };

  const supabase = createSupabaseAuthedServerClient(session.accessToken);
  const start = startOfCurrentMonthISO();

  const { data, error } = await supabase
    .from('usage_events')
    .select('event_type,quantity,created_at')
    .eq('user_id', session.user.id)
    .gte('created_at', start);

  if (error || !data) return { discoveries: 0, creatives: 0 };

  let discoveries = 0;
  let creatives = 0;
  for (const row of data as any[]) {
    const qty = Number(row.quantity || 0) || 0;
    if (row.event_type === 'discovery') discoveries += qty;
    if (row.event_type === 'creative') creatives += qty;
  }
  return { discoveries, creatives };
}

export async function ensureWithinLimit(type: UsageType, quantity: number) {
  const plan = await getCurrentPlanKey();
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const used = await getMonthlyUsage();

  const limit = type === 'discovery' ? limits.discoveriesPerMonth : limits.creativesPerMonth;
  const usedCount = type === 'discovery' ? used.discoveries : used.creatives;

  if (limit === null) return { ok: true as const, plan, limit: null, used: usedCount };
  if (usedCount + quantity <= limit) return { ok: true as const, plan, limit, used: usedCount };

  return {
    ok: false as const,
    plan,
    limit,
    used: usedCount,
    remaining: Math.max(0, limit - usedCount),
  };
}

export async function recordUsage(type: UsageType, quantity: number) {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user || !session.accessToken) return;

  const supabase = createSupabaseAuthedServerClient(session.accessToken);
  await supabase.from('usage_events').insert({
    user_id: session.user.id,
    event_type: type,
    quantity,
  });
}

