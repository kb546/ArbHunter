import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { getUserSubscription } from '@/lib/billing.server';

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default async function SettingsPage() {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user) redirect('/auth/login?next=/account/settings');

  const email = (session.user.email as string | undefined) || '—';
  const sub = await getUserSubscription();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Profile, subscription, and security.</p>
      </div>

      <Card className="p-6">
        <div className="font-semibold text-gray-900">Profile</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Email</div>
            <div className="font-medium text-gray-900 mt-1">{email}</div>
          </div>
          <div>
            <div className="text-gray-500">User ID</div>
            <div className="font-mono text-xs text-gray-900 mt-1 break-all">{session.user.id}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="font-semibold text-gray-900">Subscription</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Plan</div>
            <div className="font-medium text-gray-900 mt-1">{(sub?.plan || 'free').toUpperCase()}</div>
          </div>
          <div>
            <div className="text-gray-500">Status</div>
            <div className="font-medium text-gray-900 mt-1">{(sub?.status || 'inactive').toUpperCase()}</div>
          </div>
          <div>
            <div className="text-gray-500">Period end</div>
            <div className="font-medium text-gray-900 mt-1">{formatDate(sub?.current_period_end)}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-gray-900">Log out</div>
            <div className="text-sm text-gray-600 mt-1">Ends your session on this device.</div>
          </div>
          <form action="/api/auth/logout" method="post">
            <Button variant="outline" type="submit">Log out</Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

