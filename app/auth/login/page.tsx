'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { loginAction } from '@/app/auth/actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function LoginInner() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const res = await loginAction(formData);
      if (res?.error) setError(res.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
          <p className="text-sm text-gray-600">Access ArbHunter to run discoveries and generate creatives.</p>
        </div>

        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="next" value={next} />

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link className="text-indigo-600 hover:text-indigo-700 font-medium" href={`/auth/signup?next=${encodeURIComponent(next)}`}>
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

