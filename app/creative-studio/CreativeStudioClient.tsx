'use client';

/**
 * Creative Studio - Ad Arbitrage Focused
 * Simplified: No brand upload, auto-detect everything, always 2 variations
 */

import { useState, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { BatchConfigCard, type BatchConfig } from '@/components/creative-studio-v3/BatchConfigCard';
import { BatchProgressIndicator } from '@/components/creative-studio-v3/BatchProgressIndicator';
import { BatchResultsGrid } from '@/components/creative-studio-v3/BatchResultsGrid';
import type { GeneratedCreativeV3 } from '@/types/creative-studio';
import type { CreativePreset } from '@/services/creative-presets.service';
import type { PolicyCheckResult } from '@/services/policy-compliance.service';
import { COUNTRIES, getCountryDisplayName } from '@/lib/countries';
import { PageHeader, PageShell } from '@/components/layout/PageShell';
import { track } from '@/lib/activation.client';

function CreativeStudioContent() {
  const searchParams = useSearchParams();
  
  // Form state
  const [niche, setNiche] = useState('');
  const [geo, setGeo] = useState('US');
  const [targetAudience, setTargetAudience] = useState('');
  const [creativePreset, setCreativePreset] = useState<CreativePreset>('premium-minimal');
  const [batchSize, setBatchSize] = useState<2 | 5 | 10 | 20>(10);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAds, setGeneratedAds] = useState<GeneratedCreativeV3[]>([]);
  const [batchMetadata, setBatchMetadata] = useState<any>(null);
  const [policyMeta, setPolicyMeta] = useState<PolicyCheckResult | null>(null);
  
  // Discovery metadata (for smart routing)
  const [marginScore, setMarginScore] = useState<number | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [discoveryId, setDiscoveryId] = useState<string | null>(null);
  const [campaignAuto, setCampaignAuto] = useState(false);

  // Auto-fill from discovery deep link
  useEffect(() => {
    const discoveryId = searchParams.get('discovery');
    const discoveryNiche = searchParams.get('niche');
    const discoveryGeo = searchParams.get('geo');
    const discoveryMargin = searchParams.get('margin');
    const campaign = searchParams.get('campaign');

    if (discoveryNiche && discoveryGeo) {
      console.log('🔗 Deep link from discovery:', { discoveryId, discoveryNiche, discoveryGeo });
      if (discoveryId) setDiscoveryId(discoveryId);
      setNiche(discoveryNiche);
      setGeo(discoveryGeo);
      if (discoveryMargin) {
        setMarginScore(parseFloat(discoveryMargin));
      }
      if (campaign) {
        setCampaignId(campaign);
        setCampaignAuto(false);
      }
      toast.success(campaign ? 'Campaign created! Generate creatives to save them.' : 'Pre-filled from discovery! Ready to generate.');
    }
  }, [searchParams]);

  // If we auto-created a draft campaign and the user changes the niche/GEO, reset it to avoid mixing outputs.
  useEffect(() => {
    if (!campaignId) return;
    if (!campaignAuto) return;
    // If the user edits inputs after creating a draft, start a new draft on next generation.
    setCampaignId(null);
    setCampaignAuto(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [niche, geo]);

  async function ensureDraftCampaign(): Promise<string> {
    if (campaignId) return campaignId;
    const name = `${niche} • ${geo}`;
    toast.info('Creating a campaign draft…', { description: 'So your creatives are saved automatically.' });
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        niche,
        geo,
        target_audience: targetAudience || null,
        discovery_id: discoveryId || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Failed to create campaign (HTTP ${res.status})`);
    const newId = data?.campaign?.id as string | undefined;
    if (!newId) throw new Error('Campaign created but missing id');
    setCampaignId(newId);
    setCampaignAuto(true);
    track('campaign_created', { source: 'creative_studio_auto', campaignId: newId, niche, geo });
    return newId;
  }

  // NOTE: We intentionally route ALL generation through the batch pipeline (including 2 ads)
  // to guarantee true variety (strategist → copy → visual → prompts → images → QC).

  const createCampaignAndSave = async () => {
    if (!generatedAds.length) return;
    try {
      const name = `${niche} • ${geo}`;
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, niche, geo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Failed to create campaign (HTTP ${res.status})`);
      const newId = data?.campaign?.id as string | undefined;
      if (!newId) throw new Error('Campaign created but missing id');

      const importRes = await fetch(`/api/campaigns/${newId}/import-v3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatives: generatedAds }),
      });
      const importData = await importRes.json();
      if (!importRes.ok) throw new Error(importData?.error || `Failed to save into campaign (HTTP ${importRes.status})`);

      toast.success('Saved to campaign', { description: 'Opening your campaign…' });
      // onboarding: mark campaign saving done
      fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist: { save_campaign: { done: true, doneAt: new Date().toISOString() } },
        }),
      }).catch(() => {});
      window.location.href = `/campaigns/${newId}`;
    } catch (e: any) {
      toast.error('Could not save to campaign', { description: e?.message || String(e) });
    }
  };

  const handleBatchGenerate = async (config: BatchConfig) => {
    if (!niche || !geo) {
      toast.error('Please enter niche and select GEO');
      return;
    }

    setIsGenerating(true);
    setGeneratedAds([]);
    setBatchSize(config.batchSize);
    setBatchMetadata(null);
    setPolicyMeta(null);

    try {
      const ensuredCampaignId = await ensureDraftCampaign();
      console.log(`\n🚀 Generating batch of ${config.batchSize} ads...`);
      console.log(`   Niche: ${niche}`);
      console.log(`   GEO: ${geo}`);
      console.log(`   Model: ${config.model}`);

      const response = await fetch('/api/v3/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          geo,
          targetAudience,
          batchSize: config.batchSize,
          model: config.model,
          marginScore,
          creativePreset,
          campaignId: ensuredCampaignId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          toast.error('Upgrade required to generate creatives', {
            description: 'Your subscription is inactive. Redirecting to pricing…',
          });
          window.location.href = '/pricing';
          return;
        }
        if (response.status === 429) {
          toast.error('Usage limit reached', {
            description: data.error || 'You have reached your monthly creative limit. Upgrade to continue.',
            action: {
              label: 'View plans',
              onClick: () => (window.location.href = '/account/billing'),
            } as any,
          });
          return;
        }
        throw new Error(data.error || 'Batch generation failed');
      }

      // Convert batch variations to GeneratedCreativeV3 format
      const convertedAds: GeneratedCreativeV3[] = data.variations.map((v: any) => ({
        id: v.id,
        imageUrl: v.imageUrl,
        headline: v.headline,
        subheadline: v.subheadline,
        cta: v.cta,
        predictedCTR: v.predictedCTR,
        visualScore: v.visualScore,
        brandScore: v.brandScore,
        textScore: v.textScore,
        model: v.model,
        prompt: v.prompt,
        generatedAt: v.generatedAt,
      }));

      setGeneratedAds(convertedAds);
      if (data?.campaignId && typeof data.campaignId === 'string') {
        setCampaignId(data.campaignId);
      }
      setBatchMetadata({
        totalCost: data.totalCost,
        totalTime: data.totalTime,
        abTestPairs: data.metadata.abTestPairs,
        aiAgentsUsed: data.metadata.aiAgentsUsed,
        policy: data?.metadata?.policy || null,
      });
      setPolicyMeta((data?.metadata?.policy as PolicyCheckResult) || null);
      
      toast.success(`Generated ${config.batchSize} ads!`, {
        description: `Saved to campaign • Time: ${(data.totalTime / 1000).toFixed(1)}s • ${data.metadata.aiAgentsUsed ? '5 AI Agents Used' : 'Templates Used'}`,
      });
      track('creatives_generated', { mode: 'batch', batchSize: config.batchSize, modelMode: config.model, campaignId: ensuredCampaignId });

      console.log('✅ Batch generation complete:', data);
    } catch (error: any) {
      console.error('❌ Batch generation error:', error);
      toast.error(error.message || 'Failed to generate batch');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Creative Studio"
        description="Generate 2–20 ads via a multi-agent pipeline for real variety."
        right={
          <Button asChild variant="outline">
            <Link href="/discovery">Back to Discovery</Link>
          </Button>
        }
      />

      <div className="space-y-6">
          {/* Campaign Form */}
          <Card className="p-6 shadow-sm" data-tour="cs-form">
            <div className="mb-5">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Campaign details</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                We&apos;ll auto-detect brand, colors, and style from your niche.
              </p>
            </div>

            <div className="space-y-5">
              {/* Niche & GEO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="niche" className="text-sm font-medium mb-2 block">
                    Niche / Industry *
                  </Label>
                  <Input
                    id="niche"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g., KFC careers, Amazon delivery jobs"
                    className="h-11"
                    data-tour="cs-niche"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Brand will be auto-detected (no upload needed)
                  </p>
                </div>

                <div>
                  <Label htmlFor="geo" className="text-sm font-medium mb-2 block">
                    Geographic Market *
                  </Label>
                  <Select value={geo} onValueChange={setGeo}>
                    <SelectTrigger className="h-11" data-tour="cs-geo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {/* Worldwide */}
                      <SelectItem value="WW" className="font-semibold">
                        Worldwide
                      </SelectItem>
                      
                      {/* Tier 1 Countries */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                        Tier 1 - Premium Markets
                      </div>
                      {COUNTRIES.filter(c => c.tier === 1).map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {getCountryDisplayName(country)}
                        </SelectItem>
                      ))}
                      
                      {/* Tier 2 Countries */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase mt-2">
                        Tier 2 - Growing Markets
                      </div>
                      {COUNTRIES.filter(c => c.tier === 2).map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {getCountryDisplayName(country)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Tier 1 = High CPM (Premium) • Tier 2 = Medium CPM (Standard)
                  </p>
                </div>
              </div>

              {/* Creative Preset */}
              <div>
                <Label htmlFor="preset" className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[color:var(--primary)]" />
                  Creative Direction Preset
                </Label>
                <Select value={creativePreset} onValueChange={(v: CreativePreset) => setCreativePreset(v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium-minimal">
                      Premium Minimal - Apple-Inspired (Default)
                    </SelectItem>
                    <SelectItem value="bold-impact">
                      Bold Impact - Nike-Inspired
                    </SelectItem>
                    <SelectItem value="friendly-trustworthy">
                      Friendly & Trustworthy - Google-Inspired
                    </SelectItem>
                    <SelectItem value="lifestyle-authentic">
                      Lifestyle Authentic - Patagonia-Inspired
                    </SelectItem>
                    <SelectItem value="data-driven">
                      Platform Compliant - Meta/Google/TikTok
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1.5">
                  World-class creative direction inspired by top brands. &quot;Premium Minimal&quot; is our recommended best performer.
                </p>
              </div>

              {/* Target Audience */}
              <div>
                <Label htmlFor="audience" className="text-sm font-medium mb-2 block">
                  Target Audience (Optional)
                </Label>
                <Textarea
                  id="audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., 18-35, job seekers, hourly workers looking for flexible hours"
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Helps AI understand who to target (age, interests, needs)
                </p>
              </div>

              {/* Generation (single pipeline: 2–20 ads) */}
              <div className="pt-4" data-tour="cs-generate">
                <BatchConfigCard
                  niche={niche}
                  geo={geo}
                  targetAudience={targetAudience}
                  onGenerate={handleBatchGenerate}
                  isGenerating={isGenerating}
                />
                {!isGenerating ? (
                  <div className="mt-3 text-center">
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <Info className="h-4 w-4" />
                      <span>Even 2 ads are 2 different strategies (visual + copy + prompts + images).</span>
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          {/* Batch Progress Indicator (stays visible once completed) */}
          {(isGenerating || (generatedAds.length > 0 && batchMetadata)) && (
            <BatchProgressIndicator
              isGenerating={isGenerating}
              batchSize={batchSize}
              isComplete={!isGenerating && generatedAds.length > 0}
            />
          )}

          {/* Results */}
          {generatedAds.length > 0 && (
            <>
              {/* Post-generation journey */}
              <Card className="p-4 border bg-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-foreground">Next step</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {'Your ads were saved to a campaign draft. Continue to Campaigns to manage winners, tags, and exports.'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild disabled={!campaignId}>
                      <Link href={campaignId ? `/campaigns/${campaignId}` : '/campaigns'}>View campaign</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/campaigns">All campaigns</Link>
                    </Button>
                  </div>
                </div>
              </Card>

              {batchMetadata ? <BatchResultsGrid creatives={generatedAds} batchMetadata={batchMetadata} policy={policyMeta} /> : null}
            </>
          )}

          {/* Empty State */}
          {generatedAds.length === 0 && !isGenerating && (
            <Card className="p-12 text-center border-dashed">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ready to Generate Ads
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter a keyword (e.g., &quot;KFC Careers&quot;) and generate 2–20 ads. Each ad is designed to be strategically different.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-2xl font-bold text-[color:var(--primary)]">2–20</p>
                    <p className="text-xs text-muted-foreground mt-1">Ads</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-2xl font-bold text-[color:var(--primary)]">5</p>
                    <p className="text-xs text-muted-foreground mt-1">AI agents</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-2xl font-bold text-[color:var(--primary)]">A/B</p>
                    <p className="text-xs text-muted-foreground mt-1">2 variations</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
      </div>
    </PageShell>
  );
}

export default function CreativeStudioClient() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[color:var(--primary)]" />
      </div>
    }>
      <CreativeStudioContent />
    </Suspense>
  );
}

