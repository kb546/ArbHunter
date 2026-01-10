import { redirect } from 'next/navigation';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { getUserSubscription } from '@/lib/billing.server';
import { getCurrentPlanKey, getMonthlyUsage, PLAN_LIMITS } from '@/lib/usage.server';
import BillingClient from './BillingClient';

export default async function BillingPage() {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user) redirect('/auth/login?next=/account/billing');

  const sub = await getUserSubscription();
  const planKey = await getCurrentPlanKey();
  const usage = await getMonthlyUsage();
  const limits = PLAN_LIMITS[planKey];

  return (
    <BillingClient
      email={(session.user.email as string | undefined) || null}
      subscription={
        sub
          ? {
              provider: sub.provider,
              plan: sub.plan,
              status: sub.status,
              current_period_end: sub.current_period_end,
              cancel_at_period_end: sub.cancel_at_period_end,
            }
          : null
      }
      usage={{
        plan: planKey,
        discoveriesUsed: usage.discoveries,
        creativesUsed: usage.creatives,
        discoveriesLimit: limits.discoveriesPerMonth,
        creativesLimit: limits.creativesPerMonth,
      }}
    />
  );
}

