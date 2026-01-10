'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Zap, Sparkles, ChevronDown, Loader2 } from 'lucide-react';
import type { BrandKit, CampaignData, GenerationSettings, GenerationMode } from '@/types/creative-studio';

interface GenerationCardProps {
  onGenerate: (mode: GenerationMode, settings: GenerationSettings) => void;
  isGenerating: boolean;
  brandKit: BrandKit;
  campaignData: CampaignData;
}

export function GenerationCard({ onGenerate, isGenerating, brandKit, campaignData }: GenerationCardProps) {
  const [selectedMode, setSelectedMode] = useState<GenerationMode>('fast');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced settings
  const [size, setSize] = useState<'square' | 'portrait' | 'landscape'>('square');
  const [model, setModel] = useState<'auto' | 'fast' | 'pro'>('auto');

  const handleGenerate = () => {
    const settings: GenerationSettings = {
      size,
      model,
      variations: selectedMode === 'fast' ? 2 : 5,
    };
    onGenerate(selectedMode, settings);
  };

  return (
    <Card className="p-8 bg-card border border-border">
      <div className="text-center space-y-6">
        {/* Header */}
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-semibold mb-4">
            3
          </div>
          <h2 className="text-2xl font-bold text-foreground">Ready to generate?</h2>
          <p className="text-muted-foreground mt-2">
            AI will create brand-accurate ad creatives for <span className="font-semibold text-foreground">{brandKit.name}</span> in seconds
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Fast Mode */}
          <button
            onClick={() => setSelectedMode('fast')}
            disabled={isGenerating}
            className={`p-6 border-2 rounded-xl transition-all ${
              selectedMode === 'fast'
                ? 'border-primary bg-card shadow-lg scale-105'
                : 'border-border bg-muted/20 hover:border-primary/40 hover:bg-card'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Zap className={`mx-auto h-10 w-10 mb-3 ${
              selectedMode === 'fast' ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <p className="font-bold text-lg text-foreground">Fast Mode</p>
            <p className="text-sm text-muted-foreground mt-1">2 variations</p>
            <p className="text-xs text-muted-foreground mt-2">
              Nano Banana • ~10s
            </p>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Perfect for quick testing</p>
            </div>
          </button>

          {/* Pro Mode */}
          <button
            onClick={() => setSelectedMode('pro')}
            disabled={isGenerating}
            className={`p-6 border-2 rounded-xl transition-all ${
              selectedMode === 'pro'
                ? 'border-primary bg-card shadow-lg scale-105'
                : 'border-border bg-muted/20 hover:border-primary/40 hover:bg-card'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Sparkles className={`mx-auto h-10 w-10 mb-3 ${
              selectedMode === 'pro' ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <p className="font-bold text-lg text-foreground">Pro Mode</p>
            <p className="text-sm text-muted-foreground mt-1">5 variations</p>
            <p className="text-xs text-muted-foreground mt-2">
              Nano Banana Pro • ~30s
            </p>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Best for final production</p>
            </div>
          </button>
        </div>

        {/* Generate Button */}
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full max-w-md mx-auto h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating {selectedMode === 'fast' ? '2' : '5'} ads...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate {selectedMode === 'fast' ? '2' : '5'} Ad Creatives
            </>
          )}
        </Button>

        {/* Advanced Settings */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto transition-colors">
              Advanced Settings
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-6 p-6 bg-card rounded-xl max-w-2xl mx-auto space-y-4 border border-border">
              {/* Image Size */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Image Size
                </Label>
                <Select value={size} onValueChange={(v: any) => setSize(v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square (1:1) - Instagram, Facebook</SelectItem>
                    <SelectItem value="portrait">Portrait (4:5) - Instagram Stories</SelectItem>
                    <SelectItem value="landscape">Landscape (16:9) - YouTube, Display</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Model Selection */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  AI Model
                </Label>
                <Select value={model} onValueChange={(v: any) => setModel(v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      Auto (recommended)
                    </SelectItem>
                    <SelectItem value="fast">
                      Nano Banana (fast)
                    </SelectItem>
                    <SelectItem value="pro">
                      Nano Banana Pro (quality)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Auto mode uses Pro for final generation, Fast for previews
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Campaign Summary */}
        {!isGenerating && (
          <div className="mt-6 p-4 bg-muted/20 rounded-lg max-w-2xl mx-auto border border-border">
            <p className="text-xs text-muted-foreground mb-2">CAMPAIGN SUMMARY</p>
            <div className="flex items-center justify-center gap-4 text-sm text-foreground">
              <span><span className="font-medium">Brand:</span> {brandKit.name}</span>
              <span>•</span>
              <span><span className="font-medium">Type:</span> {campaignData.type}</span>
              <span>•</span>
              <span><span className="font-medium">Market:</span> {campaignData.geo}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}


