import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { PageHeader, PageShell } from '@/components/layout/PageShell';

export default async function DashboardPage() {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user) redirect('/auth/login?next=/dashboard');

  const email = (session.user.email as string | undefined) || null;

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description={`Welcome back${email ? `, ${email}` : ''}. Pick where you want to work.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="font-semibold text-gray-900">Discovery</div>
          <div className="text-sm text-gray-600 mt-1">
            Find profitable GEO + niche combos.
          </div>
          <div className="mt-4">
            <Button asChild className="w-full">
              <Link href="/discovery">Go to Discovery</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-semibold text-gray-900">Creative Studio</div>
          <div className="text-sm text-gray-600 mt-1">
            Generate A/B creatives from a niche.
          </div>
          <div className="mt-4">
            <Button asChild className="w-full">
              <Link href="/creative-studio">Go to Creative Studio</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-semibold text-gray-900">Campaigns</div>
          <div className="text-sm text-gray-600 mt-1">
            Organize creatives, exports, and experiments.
          </div>
          <div className="mt-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/campaigns">Open Campaigns</Link>
            </Button>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

