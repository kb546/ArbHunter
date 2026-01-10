'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { signupAction } from '@/app/auth/actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ForceDark } from '@/components/ForceDark';
import { ArrowRight, ShieldCheck, Sparkles, Zap } from 'lucide-react';

function SignupInner() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const res = await signupAction(formData);
      if (res?.error) setError(res.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ForceDark />
      {/* Decorative background (Wise/Stripe-inspired) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:36px_36px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left: value prop */}
          <div className="hidden lg:block">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <span className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-semibold">
                AH
              </span>
              <span className="font-semibold text-foreground">ArbHunter</span>
              <span className="text-muted-foreground">/</span>
              <span>Back to home</span>
            </Link>

            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-foreground">
              Create an account and start hunting.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed">
              You&apos;ll be able to run discoveries, generate A/B creatives, and track winners inside campaigns.
            </p>

            <div className="mt-8 grid gap-3 max-w-md">
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/50 backdrop-blur p-4">
                <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Opportunity Sniffer</div>
                  <div className="text-xs text-muted-foreground mt-1">Find GEO + niche combos with strong upside.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/50 backdrop-blur p-4">
                <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Creative Studio</div>
                  <div className="text-xs text-muted-foreground mt-1">Generate two variations with strong visual diversity.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/50 backdrop-blur p-4">
                <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Secure access</div>
                  <div className="text-xs text-muted-foreground mt-1">Email confirmation + protected routes.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="flex flex-col items-center">
            <div className="lg:hidden w-full max-w-md mb-6">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <span className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-semibold">
                  AH
                </span>
                <span className="font-semibold text-foreground">ArbHunter</span>
              </Link>
            </div>

            <Card className="w-full max-w-md p-6 sm:p-8 bg-card/70 border-border backdrop-blur">
              <div className="space-y-2 mb-6">
                <h2 className="text-2xl font-semibold text-foreground">Create your account</h2>
                <p className="text-sm text-muted-foreground">You&apos;ll confirm your email before accessing the dashboard.</p>
              </div>

              <form action={onSubmit} className="space-y-4">
                <input type="hidden" name="next" value={next} />

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@company.com" required />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <span className="text-xs text-muted-foreground">Min 8 chars</span>
                  </div>
                  <Input id="password" name="password" type="password" required minLength={8} />
                  <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={pending}>
                  <span className="flex items-center justify-center gap-2">
                    {pending ? 'Creating account…' : 'Create account'}
                    {!pending ? <ArrowRight className="h-4 w-4" /> : null}
                  </span>
                </Button>
              </form>

              <div className="mt-6 text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link className="text-primary hover:text-primary/90 font-medium" href={`/auth/login?next=${encodeURIComponent(next)}`}>
                  Log in
                </Link>
              </div>

              <div className="mt-6 text-xs text-muted-foreground">
                By continuing you agree to our{' '}
                <Link className="text-primary hover:text-primary/90" href="/terms">Terms</Link>,{' '}
                <Link className="text-primary hover:text-primary/90" href="/privacy">Privacy</Link>, and{' '}
                <Link className="text-primary hover:text-primary/90" href="/refund-policy">Refund Policy</Link>.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupInner />
    </Suspense>
  );
}

