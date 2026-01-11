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

  const handleGenerate = () => {
    if (isGenerating || !niche || !geo) return;
    onGenerate({ batchSize, model });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[color:var(--primary)]" />
          Batch generation
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Generate 5–20 unique variations using 5 AI agents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Batch Size Selector */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-3 block">
            Batch Size
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setBatchSize(5)}
              disabled={isGenerating}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                batchSize === 5
                  ? 'border-[color:var(--primary)] bg-primary/10 shadow-md'
                  : 'border-border hover:border-[color:var(--primary)]/50 hover:bg-muted/30'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-2xl font-bold text-foreground">5</div>
              <div className="text-xs text-muted-foreground mt-1">ads</div>
              <Badge variant="outline" className="mt-2 text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                Quick
              </Badge>
            </button>

            <button
              onClick={() => setBatchSize(10)}
              disabled={isGenerating}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                batchSize === 10
                  ? 'border-[color:var(--primary)] bg-primary/10 shadow-md'
                  : 'border-border hover:border-[color:var(--primary)]/50 hover:bg-muted/30'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-2xl font-bold text-foreground">10</div>
              <div className="text-xs text-muted-foreground mt-1">ads</div>
              <Badge variant="outline" className="mt-2 text-xs bg-primary/10 text-[color:var(--primary)] border-primary/25">
                Recommended
              </Badge>
            </button>

            <button
              onClick={() => setBatchSize(20)}
              disabled={isGenerating}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                batchSize === 20
                  ? 'border-[color:var(--primary)] bg-primary/10 shadow-md'
                  : 'border-border hover:border-[color:var(--primary)]/50 hover:bg-muted/30'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-2xl font-bold text-foreground">20</div>
              <div className="text-xs text-muted-foreground mt-1">ads</div>
              <Badge variant="outline" className="mt-2 text-xs bg-primary/10 text-[color:var(--primary)] border-primary/25">
                Pro
              </Badge>
            </button>
          </div>
        </div>

        {/* Model Mode Selector */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-3 block">
            Model Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setModel('auto')}
              disabled={isGenerating}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                model === 'auto'
                  ? 'border-[color:var(--primary)] bg-primary/10 shadow-md'
                  : 'border-border hover:border-[color:var(--primary)]/50 hover:bg-muted/30'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <TrendingUp className="w-5 h-5 text-[color:var(--primary)] mx-auto mb-1" />
              <div className="text-sm font-semibold text-foreground">Auto</div>
              <div className="text-xs text-muted-foreground mt-1">Best quality/cost</div>
            </button>

            <button
              onClick={() => setModel('fast')}
              disabled={isGenerating}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                model === 'fast'
                  ? 'border-emerald-500/60 bg-emerald-500/10 shadow-md'
                  : 'border-border hover:border-emerald-500/40 hover:bg-muted/30'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-300 mx-auto mb-1" />
              <div className="text-sm font-semibold text-foreground">Fast</div>
              <div className="text-xs text-muted-foreground mt-1">Cheaper, faster</div>
            </button>

            <button
              onClick={() => setModel('pro')}
              disabled={isGenerating}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                model === 'pro'
                  ? 'border-[color:var(--primary)] bg-primary/10 shadow-md'
                  : 'border-border hover:border-[color:var(--primary)]/50 hover:bg-muted/30'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Crown className="w-5 h-5 text-[color:var(--primary)] mx-auto mb-1" />
              <div className="text-sm font-semibold text-foreground">Pro</div>
              <div className="text-xs text-muted-foreground mt-1">Best quality</div>
            </button>
          </div>
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
        <p className="text-xs text-center text-muted-foreground">
          Each ad will be UNIQUE with different visuals, copy, and CTAs
        </p>
      </CardContent>
    </Card>
  );
}


