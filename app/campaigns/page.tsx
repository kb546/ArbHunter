import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';

export default async function CampaignsPage() {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user) redirect('/auth/login?next=/campaigns');

  const supabase = createSupabaseAuthedServerClient(session.accessToken);
  const { data: campaigns } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-600 mt-1">
            Your saved campaigns (creatives and exports live here).
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">New campaign from discovery</Link>
        </Button>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <Card className="p-8">
          <div className="text-sm text-gray-600">
            No campaigns yet. Run a discovery and click <span className="font-medium">Create Campaign</span>.
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link href="/">Run a discovery</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((c: any) => (
            <Card key={c.id} className="p-6">
              <div className="font-semibold text-gray-900 line-clamp-2">{c.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                {c.geo} • {c.niche}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Status: {String(c.status || 'draft').toUpperCase()}
              </div>
              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link href={`/campaigns/${c.id}`}>Open</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

