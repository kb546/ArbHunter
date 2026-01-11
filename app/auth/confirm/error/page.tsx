'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ForceDark } from '@/components/ForceDark';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resendSignupConfirmationAction } from '@/app/auth/actions';

function ConfirmErrorInner() {
  const sp = useSearchParams();
  const errorCode = sp.get('error_code') || sp.get('error') || 'unknown';
  const desc = sp.get('error_description') || 'This email link is invalid or has expired.';
  const next = sp.get('next') || '/dashboard';

  const [email, setEmail] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function onResend(formData: FormData) {
    setErr(null);
    setMsg(null);
    setPending(true);
    try {
      const res = await resendSignupConfirmationAction(formData);
      if (res?.error) setErr(res.error);
      else setMsg('Confirmation email sent. Check your inbox.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <ForceDark />
      <Card className="w-full max-w-lg p-6 sm:p-8 bg-card border-border">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Email confirmation failed</h1>
          <p className="text-sm text-muted-foreground">
            Error: <span className="font-medium text-foreground">{errorCode}</span>
          </p>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-muted/20 p-4">
          <div className="text-sm font-semibold text-foreground">Resend confirmation email</div>
          <div className="text-xs text-muted-foreground mt-1">
            Enter your email and we’ll send a fresh confirmation link.
          </div>

          <form action={onResend} className="mt-4 space-y-3">
            <input type="hidden" name="next" value={next} />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            {err ? (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                {err}
              </div>
            ) : null}
            {msg ? (
              <div className="text-sm text-foreground bg-primary/10 border border-primary/20 rounded-md p-3">
                {msg}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Sending…' : 'Resend confirmation email'}
            </Button>
          </form>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/auth/login?next=${encodeURIComponent(next)}`}>Back to login</Link>
          </Button>
          <Button asChild className="w-full">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function ConfirmErrorPage() {
  return (
    <Suspense>
      <ConfirmErrorInner />
    </Suspense>
  );
}

