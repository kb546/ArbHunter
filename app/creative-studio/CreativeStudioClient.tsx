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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Loader2, ChevronDown, Info, Zap, Layers } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ResultsGrid } from '@/components/creative-studio-v3/ResultsGrid';
import { BatchConfigCard, type BatchConfig } from '@/components/creative-studio-v3/BatchConfigCard';
import { BatchProgressIndicator } from '@/components/creative-studio-v3/BatchProgressIndicator';
import { BatchResultsGrid } from '@/components/creative-studio-v3/BatchResultsGrid';
import type { GeneratedCreativeV3 } from '@/types/creative-studio';
import type { CreativePreset } from '@/services/creative-presets.service';
import { COUNTRIES, getCountryDisplayName } from '@/lib/countries';
import { UsageBanner } from '@/components/UsageBanner';

function CreativeStudioContent() {
  const searchParams = useSearchParams();
  
  // Form state
  const [niche, setNiche] = useState('');
  const [geo, setGeo] = useState('US');
  const [targetAudience, setTargetAudience] = useState('');
  const [model, setModel] = useState<'auto' | 'fast' | 'pro'>('auto');
  const [creativePreset, setCreativePreset] = useState<CreativePreset>('premium-minimal');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Mode state (quick vs batch)
  const [mode, setMode] = useState<'quick' | 'batch'>('quick');
  const [batchSize, setBatchSize] = useState<5 | 10 | 20>(10);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAds, setGeneratedAds] = useState<GeneratedCreativeV3[]>([]);
  const [batchMetadata, setBatchMetadata] = useState<any>(null);
  
  // Discovery metadata (for smart routing)
  const [marginScore, setMarginScore] = useState<number | null>(null);

  // Auto-fill from discovery deep link
  useEffect(() => {
    const discoveryId = searchParams.get('discovery');
    const discoveryNiche = searchParams.get('niche');
    const discoveryGeo = searchParams.get('geo');
    const discoveryMargin = searchParams.get('margin');

    if (discoveryNiche && discoveryGeo) {
      console.log('🔗 Deep link from discovery:', { discoveryId, discoveryNiche, discoveryGeo });
      setNiche(discoveryNiche);
      setGeo(discoveryGeo);
      if (discoveryMargin) {
        setMarginScore(parseFloat(discoveryMargin));
      }
      toast.success('Pre-filled from discovery! Ready to generate.');
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!niche || !geo) {
      toast.error('Please enter niche and select GEO');
      return;
    }

    setIsGenerating(true);
    setGeneratedAds([]);

    try {
      console.log('\n🎨 Generating 2 test ads...');
      console.log(`   Niche: ${niche}`);
      console.log(`   GEO: ${geo}`);
      console.log(`   Margin Score: ${marginScore || 'unknown'}`);
      console.log(`   Model: ${model}`);

      const response = await fetch('/api/v3/generate-creatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          geo,
          targetAudience,
          model,
          marginScore,
          variations: 2, // Always 2 for A/B testing
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
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedAds(data.creatives);
      
      toast.success(`Generated 2 test ads! Cost: $${data.totalCost.toFixed(4)}`, {
        description: `Time: ${(data.totalTime / 1000).toFixed(1)}s • Model: ${data.metadata.modelUsed}`,
      });

      console.log('✅ Generation complete:', data);
    } catch (error: any) {
      console.error('❌ Generation error:', error);
      toast.error(error.message || 'Failed to generate ads');
    } finally {
      setIsGenerating(false);
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

    try {
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
      setBatchMetadata({
        totalCost: data.totalCost,
        totalTime: data.totalTime,
        abTestPairs: data.metadata.abTestPairs,
        aiAgentsUsed: data.metadata.aiAgentsUsed,
      });
      
      toast.success(`Generated ${config.batchSize} unique ads! Cost: $${data.totalCost.toFixed(4)}`, {
        description: `Time: ${(data.totalTime / 1000).toFixed(1)}s • ${data.metadata.aiAgentsUsed ? '5 AI Agents Used' : 'Templates Used'}`,
      });

      console.log('✅ Batch generation complete:', data);
    } catch (error: any) {
      console.error('❌ Batch generation error:', error);
      toast.error(error.message || 'Failed to generate batch');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Discovery
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Creative Studio
                </h1>
                <p className="text-sm text-gray-600">
                  Generate 2 test ads for your discovery
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Powered by</span>
              <span className="font-semibold text-indigo-600">Gemini Nano Banana</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <UsageBanner />

          {/* Campaign Form */}
          <Card className="p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Campaign Details</h2>
              <p className="text-sm text-gray-600 mt-1">
                We'll auto-detect brand, colors, and style from your niche
              </p>
            </div>

            <div className="space-y-6">
              {/* Niche & GEO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="niche" className="text-sm font-medium text-gray-700 mb-2 block">
                    Niche / Industry *
                  </Label>
                  <Input
                    id="niche"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g., KFC careers, Amazon delivery jobs"
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Brand will be auto-detected (no upload needed)
                  </p>
                </div>

                <div>
                  <Label htmlFor="geo" className="text-sm font-medium text-gray-700 mb-2 block">
                    Geographic Market *
                  </Label>
                  <Select value={geo} onValueChange={setGeo}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {/* Worldwide */}
                      <SelectItem value="WW" className="font-semibold">
                        🌍 Worldwide
                      </SelectItem>
                      
                      {/* Tier 1 Countries */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                        Tier 1 - Premium Markets
                      </div>
                      {COUNTRIES.filter(c => c.tier === 1).map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {getCountryDisplayName(country)}
                        </SelectItem>
                      ))}
                      
                      {/* Tier 2 Countries */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase mt-2">
                        Tier 2 - Growing Markets
                      </div>
                      {COUNTRIES.filter(c => c.tier === 2).map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {getCountryDisplayName(country)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Tier 1 = High CPM (Premium) • Tier 2 = Medium CPM (Standard)
                  </p>
                </div>
              </div>

              {/* Creative Preset */}
              <div>
                <Label htmlFor="preset" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Creative Direction Preset
                </Label>
                <Select value={creativePreset} onValueChange={(v: CreativePreset) => setCreativePreset(v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium-minimal">
                      ✨ Premium Minimal - Apple-Inspired (DEFAULT)
                    </SelectItem>
                    <SelectItem value="bold-impact">
                      ⚡ Bold Impact - Nike-Inspired
                    </SelectItem>
                    <SelectItem value="friendly-trustworthy">
                      🤝 Friendly & Trustworthy - Google-Inspired
                    </SelectItem>
                    <SelectItem value="lifestyle-authentic">
                      ❤️ Lifestyle Authentic - Patagonia-Inspired
                    </SelectItem>
                    <SelectItem value="data-driven">
                      📊 Data-Driven - Microsoft-Inspired
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1.5">
                  World-class creative direction inspired by top brands. &quot;Premium Minimal&quot; is our recommended best performer.
                </p>
              </div>

              {/* Target Audience */}
              <div>
                <Label htmlFor="audience" className="text-sm font-medium text-gray-700 mb-2 block">
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
                <p className="text-xs text-gray-500 mt-1.5">
                  Helps AI understand who to target (age, interests, needs)
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="pt-4">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
                  <button
                    onClick={() => setMode('quick')}
                    disabled={isGenerating}
                    className={`flex-1 px-4 py-3 rounded-md font-semibold text-sm transition-all ${
                      mode === 'quick'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" />
                      Quick (2 ads)
                    </div>
                  </button>
                  <button
                    onClick={() => setMode('batch')}
                    disabled={isGenerating}
                    className={`flex-1 px-4 py-3 rounded-md font-semibold text-sm transition-all ${
                      mode === 'batch'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Layers className="w-4 h-4" />
                      Batch (5-20 ads)
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs">
                        AI Agents
                      </Badge>
                    </div>
                  </button>
                </div>

                {/* Quick Mode */}
                {mode === 'quick' && (
                  <>
                    <Button
                      size="lg"
                      onClick={handleGenerate}
                      disabled={isGenerating || !niche || !geo}
                      className="w-full h-14 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating 2 test ads...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generate 2 Test Ads
                        </>
                      )}
                    </Button>

                    {/* Cost/Time Info */}
                    {!isGenerating && (
                      <div className="mt-3 text-center">
                        <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                          <Info className="h-4 w-4" />
                          <span>
                            Cost: ~$0.02 • Time: ~20s • Always 2 variations for A/B testing
                          </span>
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Batch Mode */}
                {mode === 'batch' && (
                  <BatchConfigCard
                    niche={niche}
                    geo={geo}
                    targetAudience={targetAudience}
                    onGenerate={handleBatchGenerate}
                    isGenerating={isGenerating}
                  />
                )}
              </div>

              {/* Advanced Settings (Collapsed) */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mx-auto transition-colors">
                    Advanced Settings
                    <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        AI Model Selection
                      </Label>
                      <Select value={model} onValueChange={(v: any) => setModel(v)}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">
                            🤖 Auto (Based on margin score) - Recommended
                          </SelectItem>
                          <SelectItem value="pro">
                            💎 Gemini Pro (High quality, $0.01/ad)
                          </SelectItem>
                          <SelectItem value="fast">
                            ⚡ Gemini Fast (Quick, $0.002/ad)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-2">
                        {model === 'auto' && 'Uses Pro for high-margin discoveries, Fast for low-margin'}
                        {model === 'pro' && 'Best quality for final production ads'}
                        {model === 'fast' && 'Speed optimized for bulk testing'}
                      </p>
                    </div>

                    {marginScore && (
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <p className="text-xs font-medium text-indigo-900">
                          Discovery Margin Score: {marginScore.toFixed(1)}/10
                        </p>
                        <p className="text-xs text-indigo-700 mt-1">
                          {marginScore >= 8 && 'High margin → Gemini Pro recommended'}
                          {marginScore >= 6 && marginScore < 8 && 'Medium margin → Gemini Fast recommended'}
                          {marginScore < 6 && 'Low margin → Consider skipping'}
                        </p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </Card>

          {/* Batch Progress Indicator */}
          {mode === 'batch' && isGenerating && (
            <BatchProgressIndicator isGenerating={isGenerating} batchSize={batchSize} />
          )}

          {/* Results */}
          {generatedAds.length > 0 && (
            <>
              {mode === 'batch' && batchMetadata ? (
                <BatchResultsGrid
                  creatives={generatedAds}
                  batchMetadata={batchMetadata}
                />
              ) : (
                <ResultsGrid
                  creatives={generatedAds}
                  brandKit={{
                    name: niche.split(' ')[0], // Simple brand name extraction
                    colors: { primary: '#4F46E5', secondary: '#8B5CF6' }, // Default
                  }}
                  campaignData={{
                    name: `${niche} - ${geo}`,
                    type: 'recruitment',
                    niche,
                    geo,
                    targetAudience,
                  }}
                />
              )}
            </>
          )}

          {/* Empty State */}
          {generatedAds.length === 0 && !isGenerating && (
            <Card className="p-12 text-center border-dashed">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to Generate Test Ads
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Fill in the campaign details above and click "Generate 2 Test Ads" to create
                  high-quality ad creatives for your discovery.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">2</p>
                    <p className="text-xs text-gray-600 mt-1">Variations</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">~20s</p>
                    <p className="text-xs text-gray-600 mt-1">Generation</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">$0.02</p>
                    <p className="text-xs text-gray-600 mt-1">Total Cost</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreativeStudioClient() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <CreativeStudioContent />
    </Suspense>
  );
}

