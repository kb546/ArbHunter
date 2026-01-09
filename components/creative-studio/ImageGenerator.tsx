'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Download, Heart, Image as ImageIcon, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import type { Campaign } from '@/types/creative-studio';
import type { PresetName } from '@/services/presets/presets.config';
import { PresetSelector } from './PresetSelector';
import { AgentOrchestrationDashboard } from './AgentOrchestrationDashboard';

interface ImageGeneratorProps {
  campaign: Campaign;
}

interface GeneratedVariation {
  id: string;
  imageUrl: string;
  copyStrategy: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  qualityScores: {
    visualHierarchy: number;
    brandConsistency: number;
    typographyQuality: number;
    emotionalResonance: number;
    overall: number;
  };
  predictedCTR: number;
  cost: number;
}

export function ImageGenerator({ campaign }: ImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVariations, setGeneratedVariations] = useState<GeneratedVariation[]>([]);
  const [bestVariation, setBestVariation] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [selectedPreset, setSelectedPreset] = useState<PresetName>('archival-clean');
  
  // For orchestration dashboard
  const [currentStage, setCurrentStage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCurrentStage(1);
    setElapsedTime(0);
    setGeneratedVariations([]);
    
    const startTime = Date.now();
    let stageInterval: NodeJS.Timeout;

    try {
      // Simulate stage progression for UI
      stageInterval = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
        const elapsed = (Date.now() - startTime) / 1000;
        
        if (elapsed < 10) setCurrentStage(1);
        else if (elapsed < 20) setCurrentStage(2);
        else if (elapsed < 50) setCurrentStage(3);
        else setCurrentStage(4);
      }, 500);

      // Call V2 orchestrator
      const response = await fetch('/api/v2/generate-creatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign,
          preset: selectedPreset,
          variations: 2, // Fixed to 2 for MVP
          targetAudience: campaign.target_audience || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate creatives');
      }

      clearInterval(stageInterval!);
      setCurrentStage(4);
      
      setGeneratedVariations(data.variations || []);
      setBestVariation(data.bestVariation || 0);
      setTotalCost(data.totalCost || 0);
      setTotalTime(data.totalTime || 0);
      setElapsedTime(data.totalTime / 1000 || 0);

      const bestCTR = data.variations[data.bestVariation]?.predictedCTR || 0;
      
      toast.success(`🎉 Generated ${data.variations.length} complete ads!`, {
        description: `Best CTR: ${bestCTR}% • Cost: $${data.totalCost.toFixed(3)} • ${(data.totalTime / 1000).toFixed(1)}s`,
      });

    } catch (error: any) {
      console.error('V2 Generation error:', error);
      toast.error(error.message || 'Failed to generate creatives');
      clearInterval(stageInterval!);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Preset Selector */}
      <PresetSelector
        selected={selectedPreset}
        onChange={setSelectedPreset}
      />

      {/* Agent Orchestration Dashboard */}
      {(isGenerating || generatedVariations.length > 0) && (
        <AgentOrchestrationDashboard
          isGenerating={isGenerating}
          currentStage={currentStage}
          elapsedTime={elapsedTime}
          estimatedCost={0.194}
        />
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        size="lg"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating with 5 AI Agents...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Complete Ads (2 variations)
          </>
        )}
      </Button>

      {/* Generated Variations Grid */}
      {generatedVariations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Ad Creatives</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{generatedVariations.length} variations</Badge>
              <Badge className="bg-green-500">${totalCost.toFixed(3)} total</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedVariations.map((variation, index) => (
              <Card 
                key={variation.id} 
                className={`overflow-hidden ${
                  index === bestVariation ? 'ring-2 ring-green-500 shadow-lg' : ''
                }`}
              >
                {/* Best Badge */}
                {index === bestVariation && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-green-500 text-white flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Best (CTR: {variation.predictedCTR}%)
                    </Badge>
                  </div>
                )}

                {/* Image */}
                <div className="aspect-square relative bg-slate-100">
                  <img
                    src={variation.imageUrl}
                    alt={variation.copyStrategy.headline}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Copy & Metrics */}
                <div className="p-4 space-y-3">
                  {/* Headline */}
                  <div>
                    <Label className="text-xs text-gray-500">Headline</Label>
                    <p className="font-bold text-sm">{variation.copyStrategy.headline}</p>
                  </div>

                  {/* Subheadline */}
                  <div>
                    <Label className="text-xs text-gray-500">Subheadline</Label>
                    <p className="text-sm">{variation.copyStrategy.subheadline}</p>
                  </div>

                  {/* CTA */}
                  <div>
                    <Label className="text-xs text-gray-500">Call-to-Action</Label>
                    <Badge className="bg-yellow-500 text-black">{variation.copyStrategy.cta}</Badge>
                  </div>

                  {/* Quality Scores */}
                  <div className="pt-3 border-t">
                    <Label className="text-xs text-gray-500 mb-2 block">Quality Scores</Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Visual Hierarchy:</span>
                        <span className="font-semibold ml-1">{variation.qualityScores.visualHierarchy}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Brand Consistency:</span>
                        <span className="font-semibold ml-1">{variation.qualityScores.brandConsistency}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Typography:</span>
                        <span className="font-semibold ml-1">{variation.qualityScores.typographyQuality}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Emotional:</span>
                        <span className="font-semibold ml-1">{variation.qualityScores.emotionalResonance}/100</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-semibold">Overall Score:</span>
                        <Badge variant={variation.qualityScores.overall >= 90 ? 'default' : 'secondary'}>
                          {variation.qualityScores.overall}/100
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-600 font-semibold">Predicted CTR:</span>
                        <Badge className="bg-purple-500">{variation.predictedCTR}%</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {generatedVariations.length === 0 && !isGenerating && (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              No ads generated yet.<br />
              Select a preset and click "Generate Complete Ads" to start.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

