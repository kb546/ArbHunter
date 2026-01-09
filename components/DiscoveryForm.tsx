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

interface DiscoveryFormProps {
  onSubmit: (geo: string, niche: string) => void;
  isLoading?: boolean;
}

// Tier 2.5 markets with good arbitrage potential
const GEOS = [
  { code: 'ZA', name: 'South Africa', tier: '2.5' },
  { code: 'PH', name: 'Philippines', tier: '2.5' },
  { code: 'ID', name: 'Indonesia', tier: '2.5' },
  { code: 'NG', name: 'Nigeria', tier: '2.5' },
  { code: 'EG', name: 'Egypt', tier: '2.5' },
  { code: 'KE', name: 'Kenya', tier: '2.5' },
  { code: 'PK', name: 'Pakistan', tier: '2.5' },
  { code: 'VN', name: 'Vietnam', tier: '2.5' },
  { code: 'BD', name: 'Bangladesh', tier: '2.5' },
  { code: 'TH', name: 'Thailand', tier: '2.5' },
];

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
              <SelectTrigger id="geo">
                <SelectValue placeholder="Select a geographic market" />
              </SelectTrigger>
              <SelectContent>
                {GEOS.map((g) => (
                  <SelectItem key={g.code} value={g.code}>
                    {g.name} ({g.code}) - Tier {g.tier}
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

          <Button type="submit" disabled={!geo || !niche || isLoading} className="w-full">
            {isLoading ? (
              <>
                <span className="mr-2">⏳</span>
                Analyzing Opportunity...
              </>
            ) : (
              <>
                <span className="mr-2">🔍</span>
                Run Discovery
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


