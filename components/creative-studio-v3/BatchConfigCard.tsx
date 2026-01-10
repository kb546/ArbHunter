'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Zap, Crown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface BatchConfigCardProps {
  niche: string;
  geo: string;
  targetAudience?: string;
  onGenerate: (config: BatchConfig) => void;
  isGenerating: boolean;
}

export interface BatchConfig {
  batchSize: 5 | 10 | 20;
  model: 'auto' | 'fast' | 'pro';
}

export function BatchConfigCard({ niche, geo, targetAudience, onGenerate, isGenerating }: BatchConfigCardProps) {
  const [batchSize, setBatchSize] = useState<5 | 10 | 20>(10);
  const [model, setModel] = useState<'auto' | 'fast' | 'pro'>('auto');

  // Cost calculation
  const calculateCost = (size: number, modelType: 'auto' | 'fast' | 'pro') => {
    const agentCost = 0.07; // Fixed for all sizes
    let imageCost = 0;
    
    if (modelType === 'fast') {
      imageCost = size * 0.002; // Flash model
    } else if (modelType === 'pro') {
      imageCost = size * 0.01; // Pro model
    } else {
      // Auto: Pro for Tier 1, Fast for others
      const tier1Countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'SG', 'AE', 'CH', 'NL', 'SE', 'NO'];
      const isPro = tier1Countries.includes(geo);
      imageCost = isPro ? size * 0.01 : size * 0.002;
    }
    
    return (agentCost + imageCost).toFixed(4);
  };

  // Time estimation
  const estimateTime = (size: number) => {
    // ~6 seconds per ad average
    return Math.round(size * 6);
  };

  const handleGenerate = () => {
    if (isGenerating || !niche || !geo) return;
    onGenerate({ batchSize, model });
  };

  const totalCost = calculateCost(batchSize, model);
  const perAdCost = (parseFloat(totalCost) / batchSize).toFixed(4);
  const estimatedTime = estimateTime(batchSize);

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[color:var(--primary)]" />
          Batch generation
        </CardTitle>
        <CardDescription className="text-gray-600">
          Generate 5–20 unique variations using 5 AI agents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Batch Size Selector */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">
            Batch Size
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setBatchSize(5)}
              disabled={isGenerating}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                batchSize === 5
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-2xl font-bold text-gray-800">5</div>
              <div className="text-xs text-gray-600 mt-1">ads</div>
              <Badge variant="outline" className="mt-2 text-xs bg-green-50 text-green-700 border-green-300">
                Quick
              </Badge>
            </button>

            <button
              onClick={() => setBatchSize(10)}
              disabled={isGenerating}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                batchSize === 10
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-2xl font-bold text-gray-800">10</div>
              <div className="text-xs text-gray-600 mt-1">ads</div>
              <Badge variant="outline" className="mt-2 text-xs bg-blue-50 text-blue-700 border-blue-300">
                Recommended
              </Badge>
            </button>

            <button
              onClick={() => setBatchSize(20)}
              disabled={isGenerating}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                batchSize === 20
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-2xl font-bold text-gray-800">20</div>
              <div className="text-xs text-gray-600 mt-1">ads</div>
              <Badge variant="outline" className="mt-2 text-xs bg-purple-50 text-purple-700 border-purple-300">
                Pro
              </Badge>
            </button>
          </div>
        </div>

        {/* Model Mode Selector */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">
            Model Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setModel('auto')}
              disabled={isGenerating}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                model === 'auto'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-gray-800">Auto</div>
              <div className="text-xs text-gray-500 mt-1">Best quality/cost</div>
            </button>

            <button
              onClick={() => setModel('fast')}
              disabled={isGenerating}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                model === 'fast'
                  ? 'border-green-600 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Zap className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-gray-800">Fast</div>
              <div className="text-xs text-gray-500 mt-1">Cheaper, faster</div>
            </button>

            <button
              onClick={() => setModel('pro')}
              disabled={isGenerating}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                model === 'pro'
                  ? 'border-purple-600 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Crown className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-gray-800">Pro</div>
              <div className="text-xs text-gray-500 mt-1">Best quality</div>
            </button>
          </div>
        </div>

        {/* Cost & Time Estimates */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Estimated Cost:</span>
            <span className="text-lg font-bold text-gray-800">${totalCost}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Per Ad:</span>
            <span className="text-md font-semibold text-gray-700">${perAdCost}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Estimated Time:</span>
            <span className="text-md font-semibold text-gray-700">~{estimatedTime}s</span>
          </div>
          
          {model === 'fast' && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-600">
                Fast mode is cheaper and quicker than Pro.
              </p>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !niche || !geo}
          size="lg"
          className="w-full font-semibold py-4 text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Generating {batchSize} Unique Ads...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-3" />
              Generate {batchSize} Unique Ads
            </>
          )}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-center text-gray-500">
          Each ad will be UNIQUE with different visuals, copy, and CTAs
        </p>
      </CardContent>
    </Card>
  );
}


