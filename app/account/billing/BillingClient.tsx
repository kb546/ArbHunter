'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

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
  const { email, subscription } = props;
  const [isWorking, setIsWorking] = useState(false);

  const currentPlan = subscription?.plan || 'free';
  const status = subscription?.status || 'inactive';
  const trialOrRenewal = formatDate(subscription?.current_period_end);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600 mt-1">
            Manage your plan and subscription status{email ? ` for ${email}` : ''}.
          </p>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Current plan</div>
              <div className="text-xl font-semibold text-gray-900 mt-1">{currentPlan.toUpperCase()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-xl font-semibold text-gray-900 mt-1">{status.toUpperCase()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">
                {status === 'trialing' ? 'Trial ends' : 'Next billing / period end'}
              </div>
              <div className="text-sm font-medium text-gray-900 mt-1">
                {trialOrRenewal || '—'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Cancel at period end</div>
              <div className="text-sm font-medium text-gray-900 mt-1">
                {subscription?.cancel_at_period_end ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="font-semibold text-gray-900">Starter</div>
            <div className="text-sm text-gray-600 mt-1">For early testing</div>
            <div className="mt-4">
              <Button className="w-full" disabled={isWorking} onClick={() => changePlan('starter')}>
                Switch to Starter
              </Button>
            </div>
          </Card>
          <Card className="p-5">
            <div className="font-semibold text-gray-900">Pro</div>
            <div className="text-sm text-gray-600 mt-1">For consistent scaling</div>
            <div className="mt-4">
              <Button className="w-full" disabled={isWorking} onClick={() => changePlan('pro')}>
                Switch to Pro
              </Button>
            </div>
          </Card>
          <Card className="p-5">
            <div className="font-semibold text-gray-900">Agency</div>
            <div className="text-sm text-gray-600 mt-1">For teams & volume</div>
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
              <div className="font-semibold text-gray-900">Cancel subscription</div>
              <div className="text-sm text-gray-600 mt-1">
                You can cancel anytime. Access may remain until your current period ends.
              </div>
            </div>
            <Button variant="destructive" disabled={isWorking} onClick={cancel}>
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

