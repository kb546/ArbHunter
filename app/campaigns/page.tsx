import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';

export default async function CampaignsPage() {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user) redirect('/auth/login?next=/campaigns');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Campaigns</h1>
        <p className="text-sm text-gray-600 mt-1">
          Coming next: save, compare, and export your creatives with a real campaign workflow.
        </p>
      </div>

      <Card className="p-6">
        <div className="font-semibold text-gray-900">Next improvements</div>
        <ul className="mt-3 text-sm text-gray-700 space-y-1">
          <li>- Save creatives into campaigns</li>
          <li>- A/B pairs and winner selection</li>
          <li>- Export (CSV + image zip)</li>
          <li>- Notes + tags + favorites</li>
        </ul>
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <Link href="/">Run a Discovery</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/creative-studio">Generate Creatives</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

