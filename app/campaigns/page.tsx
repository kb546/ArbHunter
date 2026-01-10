import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { Badge } from '@/components/ui/badge';
import { PageHeader, PageShell } from '@/components/layout/PageShell';

export default async function CampaignsPage() {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user) redirect('/auth/login?next=/campaigns');

  const supabase = createSupabaseAuthedServerClient(session.accessToken);
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id,name,niche,geo,status,created_at,updated_at,winner_variation_id')
    .order('created_at', { ascending: false });

  return (
    <PageShell>
      <PageHeader
        title="Campaigns"
        description="Your saved campaigns (creatives and exports live here)."
        right={
          <Button asChild variant="outline">
            <Link href="/discovery">New campaign from discovery</Link>
          </Button>
        }
      />

      {!campaigns || campaigns.length === 0 ? (
        <Card className="p-8">
          <div className="text-sm text-gray-600">
            No campaigns yet. Run a discovery and click <span className="font-medium">Create Campaign</span>.
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link href="/discovery">Run a discovery</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((c: any) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 line-clamp-2">{c.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {c.geo} • {c.niche}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <Badge variant="outline">{String(c.status || 'draft').toUpperCase()}</Badge>
                  {c.winner_variation_id ? <Badge>Winner set</Badge> : null}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-gray-500">
                <span>Updated {new Date(c.updated_at || c.created_at).toLocaleDateString()}</span>
                <span>Created {new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <div className="mt-3">
                <Button asChild className="w-full">
                  <Link href={`/campaigns/${c.id}`}>Open</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

