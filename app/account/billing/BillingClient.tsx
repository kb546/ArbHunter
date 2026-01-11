'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PageHeader, PageShell, SectionTitle } from '@/components/layout/PageShell';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

type Plan = 'starter' | 'pro' | 'agency';

export type BillingClientProps = {
  email: string | null;
  subscription:
    | null
    | {
        provider: 'stripe' | 'paddle';
        plan: 'free' | 'starter' | 'pro' | 'agency';
        status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
        current_period_end: string | null;
        cancel_at_period_end: boolean | null;
      };
  usage: {
    plan: 'free' | 'starter' | 'pro' | 'agency';
    discoveriesUsed: number;
    creativesUsed: number;
    discoveriesLimit: number | null;
    creativesLimit: number | null;
  };
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function BillingClient(props: BillingClientProps) {
  const { email, subscription, usage } = props;
  const [isWorking, setIsWorking] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const checkoutSuccess = searchParams?.get('checkout') === 'success';
  const [syncing, setSyncing] = useState<boolean>(checkoutSuccess);
  const [syncOk, setSyncOk] = useState<boolean>(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const currentPlan = subscription?.plan || 'free';
  const status = subscription?.status || 'inactive';
  const trialOrRenewal = formatDate(subscription?.current_period_end);
  const discoveriesRemaining =
    usage.discoveriesLimit === null ? null : Math.max(0, usage.discoveriesLimit - usage.discoveriesUsed);
  const creativesRemaining =
    usage.creativesLimit === null ? null : Math.max(0, usage.creativesLimit - usage.creativesUsed);

  const shouldShowSyncBanner = checkoutSuccess || syncing;

  useEffect(() => {
    if (!checkoutSuccess) return;

    let cancelled = false;
    const startedAt = Date.now();
    const maxMs = 15_000;

    (async () => {
      setSyncing(true);
      setSyncOk(false);
      setSyncMsg('Syncing your subscription… This usually takes a few seconds.');

      while (!cancelled && Date.now() - startedAt < maxMs) {
        try {
          const res = await fetch('/api/billing/status', { cache: 'no-store' });
          const data = await res.json().catch(() => ({}));
          const sub = data?.subscription;
          const st = String(sub?.status || '').toLowerCase();
          const plan = String(sub?.plan || '').toLowerCase();

          if ((st === 'trialing' || st === 'active') && plan && plan !== 'free') {
            setSyncOk(true);
            setSyncMsg('You’re upgraded. Loading your updated Billing status…');
            // Refresh server components (plan/usage) and clean URL param
            setTimeout(() => {
              if (cancelled) return;
              const url = new URL(window.location.href);
              url.searchParams.delete('checkout');
              window.history.replaceState({}, '', url.toString());
              router.refresh();
              setSyncing(false);
            }, 700);
            return;
          }
        } catch {
          // ignore transient errors while syncing
        }

        await new Promise((r) => setTimeout(r, 1500));
      }

      if (!cancelled) {
        setSyncMsg('Still syncing. It can take up to a minute. Refresh in a moment if it doesn’t update.');
        setSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutSuccess]);

  async function changePlan(plan: Plan) {
    setIsWorking(true);
    try {
      const res = await fetch('/api/paddle/subscription/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, prorationBillingMode: 'prorated_immediately' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Change plan failed (HTTP ${res.status})`);
      toast.success('Plan change requested', { description: 'It can take a few seconds to reflect. Refreshing…' });
      window.location.reload();
    } catch (e: any) {
      toast.error('Failed to change plan', { description: e?.message || String(e) });
    } finally {
      setIsWorking(false);
    }
  }

  async function cancel() {
    if (!confirm('Cancel your subscription? You may keep access until the end of the billing period/trial.')) return;
    setIsWorking(true);
    try {
      const res = await fetch('/api/paddle/subscription/cancel', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Cancel failed (HTTP ${res.status})`);
      toast.success('Cancellation requested', { description: 'It can take a few seconds to reflect. Refreshing…' });
      window.location.reload();
    } catch (e: any) {
      toast.error('Failed to cancel', { description: e?.message || String(e) });
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Billing"
        description={`Manage your plan and subscription status${email ? ` for ${email}` : ''}.`}
      />

      {shouldShowSyncBanner ? (
        <Card className="p-5 border border-border bg-card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {syncOk ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : syncing ? (
                  <Loader2 className="h-5 w-5 text-[color:var(--primary)] animate-spin" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {syncOk ? 'Upgrade complete' : syncing ? 'Finalizing your upgrade' : 'Upgrade pending'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{syncMsg || '—'}</div>
              </div>
            </div>
            {!syncing ? (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Current plan</div>
              <div className="mt-1">
                <Badge variant="outline" className="bg-transparent">
                  {currentPlan.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="mt-1">
                <Badge className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)]">
                  {status.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {status === 'trialing' ? 'Trial ends' : 'Next billing / period end'}
              </div>
              <div className="text-sm font-medium text-foreground mt-1">
                {trialOrRenewal || '—'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Cancel at period end</div>
              <div className="text-sm font-medium text-foreground mt-1">
                {subscription?.cancel_at_period_end ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle title="This month’s usage" description={`Plan: ${usage.plan.toUpperCase()}`} />

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Discoveries</div>
              <div className="mt-1 text-lg font-semibold text-foreground">
                {usage.discoveriesUsed}
                {usage.discoveriesLimit === null ? ' / ∞' : ` / ${usage.discoveriesLimit}`}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Remaining: {discoveriesRemaining === null ? '∞' : discoveriesRemaining}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Creatives generated</div>
              <div className="mt-1 text-lg font-semibold text-foreground">
                {usage.creativesUsed}
                {usage.creativesLimit === null ? ' / ∞' : ` / ${usage.creativesLimit}`}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Remaining: {creativesRemaining === null ? '∞' : creativesRemaining}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="font-semibold text-foreground">Starter</div>
            <div className="text-sm text-muted-foreground mt-1">For early testing</div>
            <div className="mt-4">
              <Button className="w-full" disabled={isWorking} onClick={() => changePlan('starter')}>
                Switch to Starter
              </Button>
            </div>
          </Card>
          <Card className="p-5">
            <div className="font-semibold text-foreground">Pro</div>
            <div className="text-sm text-muted-foreground mt-1">For consistent scaling</div>
            <div className="mt-4">
              <Button className="w-full" disabled={isWorking} onClick={() => changePlan('pro')}>
                Switch to Pro
              </Button>
            </div>
          </Card>
          <Card className="p-5">
            <div className="font-semibold text-foreground">Agency</div>
            <div className="text-sm text-muted-foreground mt-1">For teams & volume</div>
            <div className="mt-4">
              <Button className="w-full" disabled={isWorking} onClick={() => changePlan('agency')}>
                Switch to Agency
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-foreground">Cancel subscription</div>
              <div className="text-sm text-muted-foreground mt-1">
                You can cancel anytime. Access may remain until your current period ends.
              </div>
            </div>
            <Button variant="destructive" disabled={isWorking} onClick={cancel}>
              Cancel
            </Button>
          </div>
        </Card>
    </PageShell>
  );
}

