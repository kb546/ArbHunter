'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { openPaddleCheckout } from '@/lib/paddle-client';
import { PageHeader, PageShell } from '@/components/layout/PageShell';

const plans = [
  {
    key: 'starter',
    name: 'Starter',
    price: '$29',
    cadence: '/mo',
    planKey: 'starter',
    features: ['50 discoveries/month', '100 creatives/month', 'No watermarks', 'All creative presets'],
    highlight: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$79',
    cadence: '/mo',
    planKey: 'pro',
    features: ['200 discoveries/month', '500 creatives/month', 'Priority generation', 'CSV export (next)'],
    highlight: false,
  },
  {
    key: 'agency',
    name: 'Agency',
    price: '$199',
    cadence: '/mo',
    planKey: 'agency',
    features: ['Unlimited discoveries', '2,000 creatives/month', 'Priority support', 'Team features (next)'],
    highlight: false,
  },
] as const;

export default function PricingPage() {
  return (
    <PageShell>
      <PageHeader
        title="Pricing"
        description="ArbHunter is a hard-gated platform. Create an account to access Discovery and Creative Studio. Upgrade anytime to unlock higher limits."
        right={
          <>
            <Button asChild variant="outline">
              <Link href="/auth/signup">Create account</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <Card key={p.key} className={`p-6 ${p.highlight ? 'ring-2 ring-indigo-600 shadow-lg' : 'shadow-sm'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{p.name}</h2>
                  <div className="mt-2 flex items-end gap-2">
                    <div className="text-3xl font-bold text-gray-900">{p.price}</div>
                    <div className="text-gray-600">{p.cadence}</div>
                  </div>
                </div>
                {p.highlight && (
                  <div className="text-xs font-semibold bg-indigo-600 text-white px-2 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
              </div>

              <ul className="mt-5 space-y-2 text-sm text-gray-700">
                {p.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>

              <div className="mt-6 space-y-2">
                <CheckoutButton plan={p.planKey} planName={p.name} />
                <p className="text-xs text-gray-500">
                  Billing powered by Paddle (MoR). Taxes/VAT handled automatically.
                </p>
              </div>
            </Card>
          ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        Need help? Email support after we wire billing portal (Day 4).
      </div>
    </PageShell>
  );
}

function CheckoutButton({ plan, planName }: { plan: 'starter' | 'pro' | 'agency'; planName: string }) {
  return (
    <Button
      type="button"
      className="w-full"
      onClick={async () => {
        try {
          const res = await fetch('/api/paddle/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan }),
          });
          const data = await res.json();
          console.log('[PADDLE] /api/paddle/checkout response:', { status: res.status, data });

          if (!res.ok) {
            if (res.status === 401) {
              window.location.href = `/auth/login?next=${encodeURIComponent('/pricing')}`;
              return;
            }
            throw new Error(data.error || `Checkout failed (HTTP ${res.status})`);
          }

          // Preferred: open overlay checkout via Paddle.js using transactionId.
          if (data.transactionId) {
            console.log('[PADDLE] Opening overlay checkout with transactionId:', data.transactionId);
            await openPaddleCheckout(data.transactionId);
            return;
          }

          // IMPORTANT: do NOT redirect fallback while debugging; force overlay flow.
          throw new Error(
            `Checkout response missing transactionId. Got keys: ${Object.keys(data || {}).join(', ') || '(none)'}`
          );
        } catch (err: any) {
          console.error('Upgrade error:', err);
          alert(
            `Upgrade failed: ${err?.message || String(err)}\n\n` +
              `Debug tips:\n` +
              `- Ensure NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is set for the *Production* environment in Vercel\n` +
              `- Ensure NEXT_PUBLIC_PADDLE_ENV=sandbox\n` +
              `- Hard refresh (Cmd+Shift+R)`
          );
        }
      }}
    >
      Upgrade to {planName}
    </Button>
  );
}

