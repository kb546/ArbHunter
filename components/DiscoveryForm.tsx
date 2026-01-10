'use client';

import { useMemo, useState } from 'react';
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
import { COUNTRIES, getCountryDisplayName, searchCountries } from '@/lib/countries';

interface DiscoveryFormProps {
  onSubmit: (geo: string, niche: string) => void;
  isLoading?: boolean;
}

const RECOMMENDED_GEOS = ['ZA', 'PH', 'ID', 'NG', 'EG', 'KE', 'PK', 'VN', 'BD', 'TH'];

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
  const [geoQuery, setGeoQuery] = useState('');

  const filtered = useMemo(() => {
    const q = geoQuery.trim();
    if (!q) return null;
    return searchCountries(q);
  }, [geoQuery]);

  const recommended = useMemo(() => {
    const map = new Map(COUNTRIES.map((c) => [c.code, c]));
    return RECOMMENDED_GEOS.map((code) => map.get(code)).filter(Boolean) as any[];
  }, []);

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
                <div className="p-2">
                  <Input
                    value={geoQuery}
                    onChange={(e) => setGeoQuery(e.target.value)}
                    placeholder="Search countries…"
                    className="h-9"
                  />
                </div>

                {filtered ? (
                  <>
                    {filtered.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {getCountryDisplayName(c)} ({c.code}) • Tier {c.tier}
                      </SelectItem>
                    ))}
                    {filtered.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">No matches.</div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">Recommended</div>
                    {recommended.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {getCountryDisplayName(c)} ({c.code}) • Tier {c.tier}
                      </SelectItem>
                    ))}

                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase mt-2">All countries</div>
                    {COUNTRIES.filter((c) => c.code !== 'WW').map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {getCountryDisplayName(c)} ({c.code}) • Tier {c.tier}
                      </SelectItem>
                    ))}
                  </>
                )}
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


