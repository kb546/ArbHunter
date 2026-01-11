import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { Badge } from '@/components/ui/badge';
import { PageHeader, PageShell } from '@/components/layout/PageShell';

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export default async function CampaignsPage() {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user) redirect('/auth/login?next=/campaigns');

  const supabase = createSupabaseAuthedServerClient(session.accessToken);
  // NOTE: Some prod DBs may not yet have winner_variation_id (migration 010).
  // If we select it and it doesn't exist, Supabase returns an error and data is null.
  // We fallback to a safe select so Campaigns still renders.
  let campaigns: any[] | null = null;
  {
    const primary = await supabase
      .from('campaigns')
      .select('id,name,niche,geo,status,created_at,updated_at,winner_variation_id')
      .order('created_at', { ascending: false });

    if (primary.error && String(primary.error.message || '').toLowerCase().includes('winner_variation_id')) {
      const fallback = await supabase
        .from('campaigns')
        .select('id,name,niche,geo,status,created_at,updated_at')
        .order('created_at', { ascending: false });
      campaigns = (fallback.data as any) || null;
    } else {
      campaigns = (primary.data as any) || null;
    }
  }

  // Self-heal: if legacy campaigns were created with user_id NULL, RLS hides them.
  // If we have a service role key, safely backfill campaigns.user_id from discoveries.user_id for this user.
  if ((!campaigns || campaigns.length === 0) && session.user?.id) {
    const svc = getServiceSupabase();
    if (svc) {
      try {
        const { data: dRows } = await svc
          .from('discoveries')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(500);

        const discoveryIds = (dRows || []).map((r: any) => r.id).filter(Boolean);
        if (discoveryIds.length > 0) {
          await svc
            .from('campaigns')
            .update({ user_id: session.user.id })
            .is('user_id', null)
            .in('discovery_id', discoveryIds as any);
        }
      } catch {
        // ignore (best-effort)
      }

      // Re-fetch via authed client (RLS)
      const refetchPrimary = await supabase
        .from('campaigns')
        .select('id,name,niche,geo,status,created_at,updated_at,winner_variation_id')
        .order('created_at', { ascending: false });
      if (refetchPrimary.error && String(refetchPrimary.error.message || '').toLowerCase().includes('winner_variation_id')) {
        const refetchFallback = await supabase
          .from('campaigns')
          .select('id,name,niche,geo,status,created_at,updated_at')
          .order('created_at', { ascending: false });
        campaigns = (refetchFallback.data as any) || null;
      } else {
        campaigns = (refetchPrimary.data as any) || null;
      }
    }
  }

  return (
    <PageShell>
      <PageHeader
        title={<span data-tour="campaigns-header">Campaigns</span>}
        description="Your saved campaigns (creatives and exports live here)."
        right={
          <Button asChild variant="outline">
            <Link href="/discovery">New campaign from discovery</Link>
          </Button>
        }
      />

      {!campaigns || campaigns.length === 0 ? (
        <Card className="p-8">
          <div className="text-sm text-muted-foreground">
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
                  <div className="font-semibold text-foreground line-clamp-2">{c.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {c.geo} • {c.niche}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <Badge variant="outline">{String(c.status || 'draft').toUpperCase()}</Badge>
                  {'winner_variation_id' in c && c.winner_variation_id ? <Badge>Winner set</Badge> : null}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
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

