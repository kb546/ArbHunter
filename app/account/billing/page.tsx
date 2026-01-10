import { redirect } from 'next/navigation';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { getUserSubscription } from '@/lib/billing.server';
import BillingClient from './BillingClient';

export default async function BillingPage() {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user) redirect('/auth/login?next=/account/billing');

  const sub = await getUserSubscription();

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
    />
  );
}

