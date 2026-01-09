'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const plans = [
  {
    key: 'starter',
    name: 'Starter',
    price: '$29',
    cadence: '/mo',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || '',
    features: ['50 discoveries/month', '100 creatives/month', 'No watermarks', 'All creative presets'],
    highlight: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$79',
    cadence: '/mo',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '',
    features: ['200 discoveries/month', '500 creatives/month', 'Priority generation', 'CSV export (next)'],
    highlight: false,
  },
  {
    key: 'agency',
    name: 'Agency',
    price: '$199',
    cadence: '/mo',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY || '',
    features: ['Unlimited discoveries', '2,000 creatives/month', 'Priority support', 'Team features (next)'],
    highlight: false,
  },
] as const;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">Pricing</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            ArbHunter is a hard-gated platform. Create an account to access the Opportunity Sniffer and Creative Studio.
            Upgrade anytime to unlock higher limits.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button asChild variant="outline">
              <Link href="/auth/signup">Create account</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
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
                <CheckoutButton priceId={p.priceId} planName={p.name} />
                <p className="text-xs text-gray-500">
                  Requires env var: <code className="font-mono">NEXT_PUBLIC_STRIPE_PRICE_{p.name.toUpperCase()}</code>
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-gray-500">
          Need help? Email support after we wire billing portal (Day 4).
        </div>
      </div>
    </div>
  );
}

function CheckoutButton({ priceId, planName }: { priceId: string; planName: string }) {
  return (
    <Button
      type="button"
      className="w-full"
      onClick={async () => {
        if (!priceId) {
          alert(`Missing NEXT_PUBLIC_STRIPE_PRICE_* env var for ${planName}. Add it to .env.local with your Stripe Price ID.`);
          return;
        }
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Checkout failed');
          return;
        }
        window.location.href = data.url;
      }}
    >
      Upgrade to {planName}
    </Button>
  );
}

