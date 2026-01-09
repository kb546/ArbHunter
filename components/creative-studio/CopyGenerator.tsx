'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, Heart, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { Campaign, ToneOfVoice, GeneratedCopy } from '@/types/creative-studio';

interface CopyGeneratorProps {
  campaign: Campaign;
}

export function CopyGenerator({ campaign }: CopyGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopies, setGeneratedCopies] = useState<GeneratedCopy[]>([]);
  const [formData, setFormData] = useState({
    toneOfVoice: 'professional' as ToneOfVoice,
    callToAction: 'Learn More',
    variations: 5,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          niche: campaign.niche,
          geo: campaign.geo,
          targetAudience: campaign.target_audience || 'General audience',
          toneOfVoice: formData.toneOfVoice,
          callToAction: formData.callToAction,
          variations: formData.variations,
          adFormat: 'single_image',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate copy');
      }

      setGeneratedCopies(data.copies);
      toast.success(`Generated ${data.copies.length} copy variation(s)! ✍️`, {
        description: `Cost: $${data.totalCost.toFixed(4)}`,
      });

    } catch (error: any) {
      console.error('Copy generation error:', error);
      toast.error(error.message || 'Failed to generate copy');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      {/* Generation Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tone of Voice */}
        <div className="space-y-2">
          <Label>Tone of Voice</Label>
          <Select
            value={formData.toneOfVoice}
            onValueChange={(value) => setFormData({ ...formData, toneOfVoice: value as ToneOfVoice })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="authoritative">Authoritative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Call to Action */}
        <div className="space-y-2">
          <Label>Call to Action</Label>
          <Input
            value={formData.callToAction}
            onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
            placeholder="e.g. Learn More, Sign Up, Get Started"
          />
        </div>

        {/* Variations */}
        <div className="space-y-2">
          <Label>Variations: {formData.variations}</Label>
          <Slider
            value={[formData.variations]}
            onValueChange={([value]) => setFormData({ ...formData, variations: value })}
            min={3}
            max={10}
            step={1}
            className="mt-3"
          />
          <p className="text-xs text-slate-500">
            Estimated cost: ${(formData.variations * 0.01).toFixed(4)}
          </p>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        size="lg"
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating {formData.variations} copy variation(s)...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Copy
          </>
        )}
      </Button>

      {/* Generated Copies Grid */}
      {generatedCopies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Copy</h3>
            <p className="text-sm text-slate-500">{generatedCopies.length} variation(s)</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {generatedCopies.map((copy, index) => (
              <Card key={copy.id || index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{copy.copy_formula}</Badge>
                      <Badge variant="outline">{copy.tone_of_voice}</Badge>
                      {copy.engagement_score && (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          Score: {copy.engagement_score}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(
                          `${copy.headline}\n\n${copy.primary_text}\n\n${copy.description}`
                        )}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Headline */}
                  <div>
                    <Label className="text-xs text-slate-500">HEADLINE</Label>
                    <p className="font-bold text-lg mt-1">{copy.headline}</p>
                  </div>

                  {/* Primary Text */}
                  <div>
                    <Label className="text-xs text-slate-500">PRIMARY TEXT</Label>
                    <p className="text-slate-700 mt-1">{copy.primary_text}</p>
                  </div>

                  {/* Description */}
                  {copy.description && (
                    <div>
                      <Label className="text-xs text-slate-500">DESCRIPTION</Label>
                      <p className="text-slate-600 text-sm mt-1">{copy.description}</p>
                    </div>
                  )}

                  {/* CTA */}
                  <div>
                    <Label className="text-xs text-slate-500">CALL TO ACTION</Label>
                    <p className="font-semibold text-blue-600 mt-1">{copy.call_to_action}</p>
                  </div>

                  {/* Hashtags */}
                  {copy.hashtags && copy.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {copy.hashtags.map((tag, i) => (
                        <span key={i} className="text-sm text-blue-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* AI Reasoning */}
                  {copy.reasoning && (
                    <div className="border-t pt-4 mt-4">
                      <Label className="text-xs text-slate-500">AI INSIGHTS</Label>
                      <p className="text-xs text-slate-600 mt-1 italic">{copy.reasoning}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {generatedCopies.length === 0 && !isGenerating && (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              No copy generated yet.<br />
              Configure your settings and click "Generate Copy" to start.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}


