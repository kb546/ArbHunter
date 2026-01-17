import { NextRequest, NextResponse } from 'next/server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { getUserSubscription } from '@/lib/billing.server';
import { cancelDodoSubscription } from '@/lib/dodo';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getAuthedSessionFromCookies();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user's subscription
    const subscription = await getUserSubscription();
    if (!subscription || subscription.provider !== 'dodo') {
      return NextResponse.json(
        { error: 'No Dodo subscription found' },
        { status: 404 }
      );
    }

    if (!subscription.dodo_subscription_id) {
      return NextResponse.json(
        { error: 'Missing Dodo subscription ID' },
        { status: 400 }
      );
    }

    // 3. Cancel subscription at period end (user keeps access until end of billing period)
    await cancelDodoSubscription(subscription.dodo_subscription_id, true);

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current billing period',
    });
  } catch (error: any) {
    console.error('[Dodo Cancel Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
