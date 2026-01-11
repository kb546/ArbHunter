'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { COUNTRIES, getCountryDisplayName } from '@/lib/countries';

interface DiscoveryFormProps {
  onSubmit: (geo: string, niche: string) => void;
  isLoading?: boolean;
}

// (kept for future: recommended ordering if we re-add search)

// High-intent niches for arbitrage
const SUGGESTED_NICHES = [
  'SASSA vacancies',
  'TymeBank credit limit',
  'KFC careers',
  'Government jobs',
  'Online loans',
  'Work from home',
  'Education grants',
  'Small business funding',
];

export function DiscoveryForm({ onSubmit, isLoading = false }: DiscoveryFormProps) {
  const [geo, setGeo] = useState('');
  const [niche, setNiche] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (geo && niche) {
      onSubmit(geo, niche);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Opportunity Sniffer</CardTitle>
        <CardDescription>
          Discover profitable GEO/Niche combinations for Facebook-to-AdSense arbitrage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="geo">Target GEO</Label>
            <Select value={geo} onValueChange={setGeo} disabled={isLoading}>
              <SelectTrigger id="geo" data-tour="discovery-geo">
                <SelectValue placeholder="Select a geographic market" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {/* Worldwide */}
                <SelectItem value="WW" className="font-semibold">
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

          <div className="space-y-2">
            <Label htmlFor="niche">Niche / Keyword</Label>
            <Input
              id="niche"
              type="text"
              placeholder="e.g., SASSA vacancies, KFC careers"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              disabled={isLoading}
              list="niche-suggestions"
              data-tour="discovery-niche"
            />
            <datalist id="niche-suggestions">
              {SUGGESTED_NICHES.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
            <p className="text-sm text-muted-foreground">
              Try: {SUGGESTED_NICHES.slice(0, 3).join(', ')}
            </p>
          </div>

          <Button type="submit" disabled={!geo || !niche || isLoading} className="w-full" data-tour="discovery-run">
            {isLoading ? (
              <>
                Analyzing Opportunity...
              </>
            ) : (
              <>
                Run Discovery
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


