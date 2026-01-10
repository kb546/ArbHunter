import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { CampaignDetailClient } from './CampaignDetailClient';
import { PageHeader, PageShell } from '@/components/layout/PageShell';

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user) redirect('/auth/login?next=/campaigns');

  const { id } = await params;
  const supabase = createSupabaseAuthedServerClient(session.accessToken);

  const { data: campaign, error: cErr } = await supabase.from('campaigns').select('*').eq('id', id).maybeSingle();
  if (cErr || !campaign) {
    return (
      <PageShell>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Campaign not found</h1>
        <p className="text-sm text-gray-600">This campaign may not exist or you may not have access.</p>
        <Button asChild variant="outline">
          <Link href="/campaigns">Back to Campaigns</Link>
        </Button>
      </PageShell>
    );
  }

  const creativeStudioHref = `/creative-studio?${new URLSearchParams({
    campaign: String(campaign.id),
    niche: String(campaign.niche),
    geo: String(campaign.geo),
    ...(campaign.discovery_id ? { discovery: String(campaign.discovery_id) } : {}),
  }).toString()}`;

  return (
    <PageShell>
      <PageHeader
        title={campaign.name}
        description={
          <>
            {campaign.geo} • {campaign.niche} • Status: {String(campaign.status || 'draft').toUpperCase()}
            {campaign.winner_variation_id ? <span className="ml-2">• Winner selected</span> : null}
          </>
        }
        right={
          <>
            <Button asChild>
              <Link href={creativeStudioHref}>Generate creatives</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/campaigns">All campaigns</Link>
            </Button>
          </>
        }
      />

      <Card className="p-6">
        <CampaignDetailClient campaignId={id} />
      </Card>
    </PageShell>
  );
}

