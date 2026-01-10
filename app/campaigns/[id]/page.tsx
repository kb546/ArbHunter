import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { CampaignDetailClient } from './CampaignDetailClient';

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user) redirect('/auth/login?next=/campaigns');

  const { id } = await params;
  const supabase = createSupabaseAuthedServerClient(session.accessToken);

  const { data: campaign, error: cErr } = await supabase.from('campaigns').select('*').eq('id', id).maybeSingle();
  if (cErr || !campaign) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Campaign not found</h1>
        <p className="text-sm text-gray-600">This campaign may not exist or you may not have access.</p>
        <Button asChild variant="outline">
          <Link href="/campaigns">Back to Campaigns</Link>
        </Button>
      </div>
    );
  }

  const [{ data: creatives }, { data: copies }] = await Promise.all([
    supabase.from('generated_creatives').select('*').eq('campaign_id', id).order('generated_at', { ascending: false }),
    supabase.from('generated_copies').select('*').eq('campaign_id', id).order('generated_at', { ascending: false }),
  ]);

  const creativeStudioHref = `/creative-studio?${new URLSearchParams({
    campaign: String(campaign.id),
    niche: String(campaign.niche),
    geo: String(campaign.geo),
    ...(campaign.discovery_id ? { discovery: String(campaign.discovery_id) } : {}),
  }).toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500">Campaign</div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{campaign.name}</h1>
          <div className="text-sm text-gray-600 mt-1">
            {campaign.geo} • {campaign.niche} • Status: {String(campaign.status || 'draft').toUpperCase()}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={creativeStudioHref}>Generate creatives</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/campaigns">All campaigns</Link>
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <CampaignDetailClient creatives={(creatives as any) || []} copies={(copies as any) || []} />
      </Card>
    </div>
  );
}

