'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Package, Tag, Check } from 'lucide-react';
import type { CampaignData, CampaignType } from '@/types/creative-studio';
import { COUNTRIES, getCountryDisplayName } from '@/lib/countries';

interface CampaignSetupCardProps {
  onCampaignSetup: (campaign: CampaignData) => void;
  initialCampaign?: CampaignData | null;
  brandName: string;
}

export function CampaignSetupCard({ onCampaignSetup, initialCampaign, brandName }: CampaignSetupCardProps) {
  const [campaignName, setCampaignName] = useState(initialCampaign?.name || '');
  const [campaignType, setCampaignType] = useState<CampaignType>(initialCampaign?.type || 'recruitment');
  const [niche, setNiche] = useState(initialCampaign?.niche || '');
  const [geo, setGeo] = useState(initialCampaign?.geo || '');
  const [targetAudience, setTargetAudience] = useState(initialCampaign?.targetAudience || '');
  const [keyMessage, setKeyMessage] = useState(initialCampaign?.keyMessage || '');
  const [isCompleted, setIsCompleted] = useState(!!initialCampaign);

  const campaignTypes: { value: CampaignType; label: string; icon: any; description: string }[] = [
    {
      value: 'recruitment',
      label: 'Job Recruitment',
      icon: Briefcase,
      description: 'Hiring ads for service industry',
    },
    {
      value: 'product',
      label: 'Product or Service',
      icon: Package,
      description: 'Promote products or services',
    },
    {
      value: 'sale',
      label: 'Sale or Promotion',
      icon: Tag,
      description: 'Discount offers & limited-time deals',
    },
  ];

  const handleSave = () => {
    if (!campaignName || !niche || !geo) {
      alert('Please fill in all required fields');
      return;
    }

    const campaign: CampaignData = {
      name: campaignName,
      type: campaignType,
      niche,
      geo,
      targetAudience,
      keyMessage,
    };

    onCampaignSetup(campaign);
    setIsCompleted(true);
  };

  return (
    <Card className="p-8 shadow-sm border border-border bg-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              2
            </span>
            Campaign Details
          </h2>
          <p className="text-sm text-muted-foreground mt-1 ml-10">
            Tell us what you're advertising for {brandName}
          </p>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
            <Check className="h-5 w-5" />
            Completed
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Campaign Name */}
        <div>
          <Label htmlFor="campaignName" className="text-sm font-medium text-foreground mb-2 block">
            Campaign Name *
          </Label>
          <Input
            id="campaignName"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder={`e.g., ${brandName} Recruitment - ${geo || 'US'}`}
            className="h-11"
          />
        </div>

        {/* Campaign Type */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-3 block">
            What are you advertising? *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaignTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setCampaignType(type.value)}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  campaignType === type.value
                    ? 'border-primary bg-muted/30'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <type.icon className={`h-6 w-6 mb-2 ${
                  campaignType === type.value ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <p className="font-semibold text-sm text-foreground">{type.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Niche & Geo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="niche" className="text-sm font-medium text-foreground mb-2 block">
              Niche / Industry *
            </Label>
            <Input
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g., Fast Food, Delivery Drivers"
              className="h-11"
            />
          </div>

          <div>
            <Label htmlFor="geo" className="text-sm font-medium text-foreground mb-2 block">
              Geographic Market *
            </Label>
            <Select value={geo} onValueChange={setGeo}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="WW" className="font-semibold text-foreground">
                  Worldwide
                </SelectItem>

                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                  Tier 1 - Premium Markets
                </div>
                {COUNTRIES.filter((c) => c.tier === 1).map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {getCountryDisplayName(country)}
                  </SelectItem>
                ))}

                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase mt-2">
                  Tier 2 - Growing Markets
                </div>
                {COUNTRIES.filter((c) => c.tier === 2).map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {getCountryDisplayName(country)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <Label htmlFor="targetAudience" className="text-sm font-medium text-foreground mb-2 block">
            Target Audience
          </Label>
          <Textarea
            id="targetAudience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., 18-35, job seekers, hourly workers looking for flexible hours"
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Describe who you're trying to reach (age, interests, needs)
          </p>
        </div>

        {/* Key Message */}
        <div>
          <Label htmlFor="keyMessage" className="text-sm font-medium text-foreground mb-2 block">
            Key Message (Optional)
          </Label>
          <Input
            id="keyMessage"
            value={keyMessage}
            onChange={(e) => setKeyMessage(e.target.value)}
            placeholder="e.g., Weekly pay, flexible hours, start this week"
            className="h-11"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Main benefits or selling points to highlight
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!campaignName || !niche || !geo}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-11"
        >
          {isCompleted ? 'Update Campaign' : 'Save Campaign'}
        </Button>
      </div>
    </Card>
  );
}


