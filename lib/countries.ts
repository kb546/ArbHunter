/**
 * Global Country List for Ad Arbitrage
 * Tier 0: Worldwide
 * Tier 1: High-value, high-CPM markets (Premium)
 * Tier 2: Growing markets, good volume (Standard)
 */

export interface Country {
  code: string;
  name: string;
  flag: string;
  tier: 0 | 1 | 2;
  cpm: 'high' | 'medium' | 'low';
  recommendedModel: 'pro' | 'fast';
}

export const COUNTRIES: Country[] = [
  // Tier 0: Worldwide
  {
    code: 'WW',
    name: 'Worldwide',
    flag: '🌍',
    tier: 0,
    cpm: 'high',
    recommendedModel: 'pro',
  },

  // Tier 1: Premium Markets (High CPM, High Competition)
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },
  {
    code: 'SE',
    name: 'Sweden',
    flag: '🇸🇪',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },
  {
    code: 'NO',
    name: 'Norway',
    flag: '🇳🇴',
    tier: 1,
    cpm: 'high',
    recommendedModel: 'pro',
  },

  // Tier 2: Growing Markets (Medium-High CPM, Good Volume)
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    tier: 2,
    cpm: 'medium',
    recommendedModel: 'fast',
  },
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    tier: 2,
    cpm: 'medium',
    recommendedModel: 'fast',
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    tier: 2,
    cpm: 'medium',
    recommendedModel: 'fast',
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    tier: 2,
    cpm: 'medium',
    recommendedModel: 'fast',
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    tier: 2,
    cpm: 'medium',
    recommendedModel: 'fast',
  },
  {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    tier: 2,
    cpm: 'medium',
    recommendedModel: 'fast',
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    tier: 2,
    cpm: 'medium',
    recommendedModel: 'fast',
  },
  {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    tier: 2,
    cpm: 'medium',
    recommendedModel: 'fast',
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    tier: 2,
    cpm: 'medium',
    recommendedModel: 'fast',
  },
  {
    code: 'TH',
    name: 'Thailand',
    flag: '🇹🇭',
    tier: 2,
    cpm: 'medium',
    recommendedModel: 'fast',
  },
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    tier: 2,
    cpm: 'low',
    recommendedModel: 'fast',
  },
  {
    code: 'VN',
    name: 'Vietnam',
    flag: '🇻🇳',
    tier: 2,
    cpm: 'low',
    recommendedModel: 'fast',
  },
  {
    code: 'PL',
    name: 'Poland',
    flag: '🇵🇱',
    tier: 2,
    cpm: 'medium',
    recommendedModel: 'fast',
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    tier: 2,
    cpm: 'medium',
    recommendedModel: 'fast',
  },
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    tier: 2,
    cpm: 'low',
    recommendedModel: 'fast',
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    tier: 2,
    cpm: 'low',
    recommendedModel: 'fast',
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    tier: 2,
    cpm: 'low',
    recommendedModel: 'fast',
  },
];

// Helper functions
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getCountriesByTier(tier: 0 | 1 | 2): Country[] {
  return COUNTRIES.filter(c => c.tier === tier);
}

export function getTier1Countries(): Country[] {
  return COUNTRIES.filter(c => c.tier === 1);
}

export function getTier2Countries(): Country[] {
  return COUNTRIES.filter(c => c.tier === 2);
}

export function getRecommendedModel(countryCode: string): 'pro' | 'fast' {
  const country = getCountryByCode(countryCode);
  return country?.recommendedModel || 'fast';
}

// For display in dropdowns
export function getCountryDisplayName(country: Country): string {
  return `${country.flag} ${country.name}`;
}

// Search/filter
export function searchCountries(query: string): Country[] {
  const lowerQuery = query.toLowerCase();
  return COUNTRIES.filter(
    c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.code.toLowerCase().includes(lowerQuery)
  );
}


