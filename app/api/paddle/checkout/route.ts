import { NextResponse } from 'next/server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createCheckoutTransaction, getFirstActiveRecurringPriceIdForProduct } from '@/lib/paddle';

type Plan = 'starter' | 'pro' | 'agency';
type Body = { plan: Plan };

function productIdForPlan(plan: Plan) {
  const starter = process.env.PADDLE_PRODUCT_STARTER;
  const pro = process.env.PADDLE_PRODUCT_PRO;
  const agency = process.env.PADDLE_PRODUCT_AGENCY;
  if (plan === 'starter') return starter;
  if (plan === 'pro') return pro;
  return agency;
}

export async function POST(req: Request) {
  try {
    const session = await getAuthedSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan } = (await req.json()) as Body;
    if (!plan || !['starter', 'pro', 'agency'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const productId = productIdForPlan(plan as Plan);
    if (!productId) {
      return NextResponse.json({ error: `Missing Paddle product id for ${plan}` }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const priceId = await getFirstActiveRecurringPriceIdForProduct(productId);

    const checkout = await createCheckoutTransaction({
      priceId,
      userEmail: session.user.email || '',
      userId: session.user.id,
      successUrl: `${appUrl}/?checkout=success`,
      cancelUrl: `${appUrl}/pricing?checkout=cancel`,
    });

    return NextResponse.json({ url: checkout.url, transactionId: checkout.transactionId });
  } catch (error: any) {
    console.error('Paddle checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}

