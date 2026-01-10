'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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

function pct(used: number, limit: number | null): number | null {
  if (limit === null) return null;
  if (limit <= 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
}

function barClass(percent: number | null) {
  if (percent === null) return 'bg-indigo-600';
  if (percent >= 95) return 'bg-red-600';
  if (percent >= 80) return 'bg-amber-500';
  return 'bg-indigo-600';
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
  const dPct = pct(data.usage.discoveries, data.limits.discoveriesPerMonth);
  const cPct = pct(data.usage.creatives, data.limits.creativesPerMonth);

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

          <div className="mt-3 space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Discoveries</span>
                <span>{dPct === null ? '—' : `${dPct}%`}</span>
              </div>
              <Progress
                value={dPct ?? 0}
                className="h-2 bg-gray-100"
                indicatorClassName={barClass(dPct)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Creatives</span>
                <span>{cPct === null ? '—' : `${cPct}%`}</span>
              </div>
              <Progress value={cPct ?? 0} className="h-2 bg-gray-100" indicatorClassName={barClass(cPct)} />
            </div>
            <div className="text-xs text-gray-500">
              Color thresholds: <span className="font-medium text-amber-700">80%</span> warning •{' '}
              <span className="font-medium text-red-700">95%</span> critical
            </div>
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

