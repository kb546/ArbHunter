import { NextResponse } from 'next/server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { getStripe } from '@/lib/stripe';

type CheckoutBody = {
  priceId: string;
};

export async function POST(req: Request) {
  try {
    const session = await getAuthedSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = (await req.json()) as CheckoutBody;
    if (!priceId) {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
    }

    // Security: only allow configured price IDs
    const allowed = new Set(
      [process.env.STRIPE_PRICE_STARTER, process.env.STRIPE_PRICE_PRO, process.env.STRIPE_PRICE_AGENCY].filter(Boolean) as string[]
    );
    if (allowed.size > 0 && !allowed.has(priceId)) {
      return NextResponse.json({ error: 'Invalid priceId' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const stripe = getStripe();

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancel`,
      customer_email: session.user.email ?? undefined,
      client_reference_id: session.user.id,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}

