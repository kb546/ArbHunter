import { NextRequest, NextResponse } from 'next/server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { getDodoPaymentLink } from '@/lib/dodo';

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
    const { plan } = await req.json();
    if (!plan || !['starter', 'pro', 'agency'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const productId = DODO_PRODUCT_IDS[plan as keyof typeof DODO_PRODUCT_IDS];
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID not configured for plan' },
        { status: 500 }
      );
    }

    // 3. Generate payment link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutUrl = getDodoPaymentLink({
      productId,
      quantity: 1,
      successUrl: `${appUrl}/account/billing?checkout=success`,
      cancelUrl: `${appUrl}/pricing`,
      metadata: {
        user_id: session.user.id,
        user_email: session.user.email || '',
        plan,
      },
    });

    // 4. Return checkout URL for redirect
    return NextResponse.json({
      checkoutUrl,
      productId,
    });
  } catch (error: any) {
    console.error('[Dodo Checkout Error]', error);
    return NextResponse.json(
      { error: error.message || 'Checkout creation failed' },
      { status: 500 }
    );
  }
}
