'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type UsagePayload = {
  plan: 'free' | 'starter' | 'pro' | 'agency';
  usage: { discoveries: number; creatives: number };
  limits: { discoveriesPerMonth: number | null; creativesPerMonth: number | null };
};

function fmtLimit(n: number | null) {
  return n === null ? '∞' : String(n);
}

function remaining(used: number, limit: number | null) {
  if (limit === null) return null;
  return Math.max(0, limit - used);
}

export function UsageBanner() {
  const [data, setData] = useState<UsagePayload | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/usage', { method: 'GET' });
        if (!res.ok) return; // unauth or error -> don't show banner
        const json = (await res.json()) as UsagePayload;
        if (!cancelled) setData(json);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (hidden || !data) return null;

  const dRem = remaining(data.usage.discoveries, data.limits.discoveriesPerMonth);
  const cRem = remaining(data.usage.creatives, data.limits.creativesPerMonth);

  const isLow =
    (dRem !== null && dRem <= 5) ||
    (cRem !== null && cRem <= 10) ||
    data.plan === 'free';

  return (
    <Card className="p-4 border-l-4 border-l-indigo-600">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">This month</span>{' '}
            <span className="text-gray-500">(Plan: {data.plan.toUpperCase()})</span>
          </div>
          <div className="mt-1 text-sm text-gray-800">
            <span className="font-medium">Discoveries:</span> {data.usage.discoveries} / {fmtLimit(data.limits.discoveriesPerMonth)}
            {'  '}•{'  '}
            <span className="font-medium">Creatives:</span> {data.usage.creatives} / {fmtLimit(data.limits.creativesPerMonth)}
            {isLow ? (
              <>
                {'  '}•{'  '}
                <span className="text-amber-700 font-medium">Running low</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant={isLow ? 'default' : 'outline'}>
            <Link href={data.plan === 'free' ? '/pricing' : '/account/billing'}>
              {data.plan === 'free' ? 'Upgrade' : 'Manage billing'}
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => setHidden(true)}>
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  );
}

