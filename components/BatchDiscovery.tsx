'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface BatchDiscoveryProps {
  onSubmit: (geo: string, niches: string[]) => void;
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

// Suggested niche templates
const SUGGESTED_NICHES = [
  'SASSA vacancies',
  'TymeBank credit limit',
  'KFC careers',
  'Government jobs',
  'Online loans',
  'Work from home',
  'Education grants',
  'Small business funding',
  'McDonald careers',
  'Uber driver registration',
];

export function BatchDiscovery({ onSubmit, isLoading = false }: BatchDiscoveryProps) {
  const [geo, setGeo] = useState('');
  const [currentNiche, setCurrentNiche] = useState('');
  const [niches, setNiches] = useState<string[]>([]);

  const handleAddNiche = () => {
    if (currentNiche && !niches.includes(currentNiche)) {
      setNiches([...niches, currentNiche]);
      setCurrentNiche('');
    }
  };

  const handleRemoveNiche = (nicheToRemove: string) => {
    setNiches(niches.filter((n) => n !== nicheToRemove));
  };

  const handleAddSuggested = (niche: string) => {
    if (!niches.includes(niche)) {
      setNiches([...niches, niche]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (geo && niches.length > 0) {
      onSubmit(geo, niches);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentNiche) {
      e.preventDefault();
      handleAddNiche();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Batch Discovery</CardTitle>
        <CardDescription>
          Test multiple niches at once in a single GEO - perfect for competitive analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* GEO Selector */}
          <div className="space-y-2">
            <Label htmlFor="batch-geo">Target GEO</Label>
            <Select value={geo} onValueChange={setGeo} disabled={isLoading}>
              <SelectTrigger id="batch-geo">
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

          {/* Niche Input */}
          <div className="space-y-2">
            <Label htmlFor="batch-niche">Add Niches (one at a time)</Label>
            <div className="flex gap-2">
              <input
                id="batch-niche"
                type="text"
                placeholder="e.g., KFC careers"
                value={currentNiche}
                onChange={(e) => setCurrentNiche(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddNiche}
                disabled={!currentNiche || isLoading}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Added Niches */}
          {niches.length > 0 && (
            <div className="space-y-2">
              <Label>Niches to Discover ({niches.length})</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px] bg-muted/30">
                {niches.map((niche, idx) => (
                  <Badge key={idx} variant="default" className="pl-3 pr-2 py-1.5 text-sm">
                    {niche}
                    <button
                      type="button"
                      onClick={() => handleRemoveNiche(niche)}
                      className="ml-2 hover:text-destructive"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick Add Suggestions */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick Add</Label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_NICHES.map((niche) => (
                <Badge
                  key={niche}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => !isLoading && handleAddSuggested(niche)}
                >
                  + {niche}
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!geo || niches.length === 0 || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <span className="mr-2">⏳</span>
                Analyzing {niches.length} {niches.length === 1 ? 'Niche' : 'Niches'}...
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                Run Batch Discovery ({niches.length} {niches.length === 1 ? 'Niche' : 'Niches'})
              </>
            )}
          </Button>

          {niches.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              ⚡ This will analyze {niches.length} {niches.length === 1 ? 'niche' : 'niches'} in{' '}
              {geo || 'your selected GEO'}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}


