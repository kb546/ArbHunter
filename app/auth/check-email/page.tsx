import Link from 'next/link';
import { ForceDark } from '@/components/ForceDark';

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const { email, next } = await searchParams;
  const nextPath = next && next.startsWith('/') ? next : '/discovery';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <ForceDark />
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link{email ? ` to ${email}` : ''}. Click it to finish creating your account.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href={`/auth/login?next=${encodeURIComponent(nextPath)}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to login
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

