import { NextRequest, NextResponse } from 'next/server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { getUserSubscription } from '@/lib/billing.server';
import { updateDodoSubscription } from '@/lib/dodo';

const DODO_PRODUCT_IDS = {
  starter: process.env.DODO_PRODUCT_STARTER!,
  pro: process.env.DODO_PRODUCT_PRO!,
  agency: process.env.DODO_PRODUCT_AGENCY!,
} as const;

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getAuthedSessionFromCookies();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const { newPlan } = await req.json();
    if (!newPlan || !['starter', 'pro', 'agency'].includes(newPlan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // 3. Get user's subscription
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

    // 4. Prevent "downgrading" to same plan
    if (subscription.plan === newPlan) {
      return NextResponse.json(
        { error: 'Already on this plan' },
        { status: 400 }
      );
    }

    // 5. Get new product ID
    const newProductId = DODO_PRODUCT_IDS[newPlan as keyof typeof DODO_PRODUCT_IDS];
    if (!newProductId) {
      return NextResponse.json(
        { error: 'Product ID not configured for plan' },
        { status: 500 }
      );
    }

    // 6. Update subscription (Dodo handles proration automatically)
    await updateDodoSubscription(subscription.dodo_subscription_id, newProductId);

    return NextResponse.json({
      success: true,
      message: `Plan changed to ${newPlan}. Changes will take effect immediately.`,
    });
  } catch (error: any) {
    console.error('[Dodo Plan Change Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to change plan' },
      { status: 500 }
    );
  }
}
