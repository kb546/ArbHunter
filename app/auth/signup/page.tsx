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

function SignupInner() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

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
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <ForceDark />
      <Card className="w-full max-w-md p-6 bg-card border-border">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start finding opportunities and generating creatives.</p>
        </div>

        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="next" value={next} />

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
            <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>

        <div className="mt-6 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link className="text-primary hover:text-primary/90 font-medium" href={`/auth/login?next=${encodeURIComponent(next)}`}>
            Log in
          </Link>
        </div>
      </Card>
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

