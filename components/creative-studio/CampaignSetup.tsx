'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Campaign, CampaignSetupFormData } from '@/types/creative-studio';

interface CampaignSetupProps {
  onCampaignCreated: (campaign: Campaign) => void;
}

export function CampaignSetup({ onCampaignCreated }: CampaignSetupProps) {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CampaignSetupFormData>({
    name: '',
    niche: '',
    geo: '',
    targetAudience: '',
  });

  // Pre-fill from discovery deep link
  useEffect(() => {
    const discoveryId = searchParams.get('discovery');
    const niche = searchParams.get('niche');
    const geo = searchParams.get('geo');

    if (discoveryId && niche && geo) {
      setFormData(prev => ({
        ...prev,
        name: `${niche} Campaign - ${geo}`,
        niche: decodeURIComponent(niche),
        geo: geo.toUpperCase(),
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const discoveryId = searchParams.get('discovery');

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          niche: formData.niche,
          geo: formData.geo,
          target_audience: formData.targetAudience || undefined,
          discovery_id: discoveryId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign');
      }

      toast.success('Campaign created successfully! 🎉');
      onCampaignCreated(data.campaign);

      // Reset form if not from discovery
      if (!discoveryId) {
        setFormData({
          name: '',
          niche: '',
          geo: '',
          targetAudience: '',
        });
      }

    } catch (error: any) {
      console.error('Campaign creation error:', error);
      toast.error(error.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            placeholder="e.g. KFC Careers - South Africa"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Niche */}
        <div className="space-y-2">
          <Label htmlFor="niche">Niche *</Label>
          <Input
            id="niche"
            placeholder="e.g. Fast Food Careers"
            value={formData.niche}
            onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
            required
          />
        </div>

        {/* GEO */}
        <div className="space-y-2">
          <Label htmlFor="geo">Target Market (GEO) *</Label>
          <Input
            id="geo"
            placeholder="e.g. ZA"
            value={formData.geo}
            onChange={(e) => setFormData({ ...formData, geo: e.target.value.toUpperCase() })}
            maxLength={2}
            required
          />
          <p className="text-xs text-slate-500">2-letter country code</p>
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Input
            id="targetAudience"
            placeholder="e.g. Young adults 18-25"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
          />
        </div>
      </div>

      {/* Description (Full Width) */}
      <div className="space-y-2">
        <Label htmlFor="description">Additional Context (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Any additional context about your target audience, campaign goals, or brand guidelines..."
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="lg"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Campaign...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Create Campaign
            </>
          )}
        </Button>
      </div>
    </form>
  );
}


