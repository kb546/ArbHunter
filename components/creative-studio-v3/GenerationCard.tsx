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
    <Card className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100">
      <div className="text-center space-y-6">
        {/* Header */}
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold mb-4">
            3
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ready to Generate?</h2>
          <p className="text-gray-600 mt-2">
            AI will create brand-accurate ad creatives for <span className="font-semibold text-indigo-600">{brandKit.name}</span> in seconds
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
                ? 'border-indigo-500 bg-white shadow-lg scale-105'
                : 'border-gray-200 bg-white/50 hover:border-indigo-300 hover:bg-white'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Zap className={`mx-auto h-10 w-10 mb-3 ${
              selectedMode === 'fast' ? 'text-indigo-600' : 'text-gray-400'
            }`} />
            <p className="font-bold text-lg text-gray-900">Fast Mode</p>
            <p className="text-sm text-gray-600 mt-1">2 variations</p>
            <p className="text-xs text-gray-500 mt-2">
              ⚡ Nano Banana • ~10s • Low cost
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Perfect for quick testing</p>
            </div>
          </button>

          {/* Pro Mode */}
          <button
            onClick={() => setSelectedMode('pro')}
            disabled={isGenerating}
            className={`p-6 border-2 rounded-xl transition-all ${
              selectedMode === 'pro'
                ? 'border-purple-500 bg-white shadow-lg scale-105'
                : 'border-gray-200 bg-white/50 hover:border-purple-300 hover:bg-white'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Sparkles className={`mx-auto h-10 w-10 mb-3 ${
              selectedMode === 'pro' ? 'text-purple-600' : 'text-gray-400'
            }`} />
            <p className="font-bold text-lg text-gray-900">Pro Mode</p>
            <p className="text-sm text-gray-600 mt-1">5 variations</p>
            <p className="text-xs text-gray-500 mt-2">
              💎 Nano Banana Pro • ~30s • Higher quality
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Best for final production</p>
            </div>
          </button>
        </div>

        {/* Generate Button */}
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full max-w-md mx-auto h-14 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
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
            <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mx-auto transition-colors">
              Advanced Settings
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-6 p-6 bg-white rounded-xl max-w-2xl mx-auto space-y-4">
              {/* Image Size */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
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
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  AI Model
                </Label>
                <Select value={model} onValueChange={(v: any) => setModel(v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      🤖 Auto (Best Quality) - Recommended
                    </SelectItem>
                    <SelectItem value="fast">
                      ⚡ Nano Banana (Fast) - 2-5 seconds
                    </SelectItem>
                    <SelectItem value="pro">
                      💎 Nano Banana Pro (Quality) - 10-15 seconds
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  Auto mode uses Pro for final generation, Fast for previews
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Campaign Summary */}
        {!isGenerating && (
          <div className="mt-6 p-4 bg-white/80 rounded-lg max-w-2xl mx-auto">
            <p className="text-xs text-gray-500 mb-2">CAMPAIGN SUMMARY</p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-700">
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


