/**
 * CREATIVE STUDIO V2: PRESET CONFIGURATIONS
 * 
 * 5 presets (including "None") that configure all 4 agents
 * to generate specific creative styles
 */

export type PresetName = 'none' | 'archival-clean' | 'lifestyle-authentic' | 'bold-impact' | 'cinematic-premium';

export interface Preset {
  id: PresetName;
  name: string;
  description: string;
  bestFor: string[];
  icon: string;
  
  // Agent configurations
  copywriting: {
    tone: string;
    formula: string;
    style: string;
  };
  
  creativeDirection: {
    concept: string;
    mood: string;
    aesthetic: string;
  };
  
  graphicDesign: {
    background: string;
    lighting: string;
    composition: string;
  };
  
  promptEngineering: {
    style: string;
    keywords: string[];
    quality: string;
  };
}

// ============================================================================
// PRESET DEFINITIONS
// ============================================================================

export const PRESETS: Record<PresetName, Preset> = {
  // ──────────────────────────────────────────────────────────────────────────
  // PRESET 0: NONE (Full Creative Control)
  // ──────────────────────────────────────────────────────────────────────────
  'none': {
    id: 'none',
    name: 'None',
    description: 'Full creative control - AI agents adapt to your specific niche without constraints',
    bestFor: ['Experienced users', 'Unique campaigns', 'Custom requirements'],
    icon: '🎯',
    
    copywriting: {
      tone: 'adaptive', // Analyzes niche and decides
      formula: 'adaptive', // Chooses best formula
      style: 'niche-optimized',
    },
    
    creativeDirection: {
      concept: 'pure brand analysis',
      mood: 'niche-appropriate',
      aesthetic: 'optimal for target audience',
    },
    
    graphicDesign: {
      background: 'niche-optimized',
      lighting: 'adaptive',
      composition: 'best for specific niche',
    },
    
    promptEngineering: {
      style: 'custom optimization',
      keywords: [], // No constraints
      quality: 'maximum flexibility',
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PRESET 1: ARCHIVAL CLEAN (Professional Product Photography)
  // ──────────────────────────────────────────────────────────────────────────
  'archival-clean': {
    id: 'archival-clean',
    name: 'Archival Clean',
    description: 'Professional product photography with studio lighting - Apple-inspired minimalism',
    bestFor: ['Job ads', 'Corporate campaigns', 'Premium brands', 'High-trust positioning'],
    icon: '📸',
    
    copywriting: {
      tone: 'professional',
      formula: 'benefit-focused',
      style: 'clear and direct',
    },
    
    creativeDirection: {
      concept: 'Premium Employer Branding',
      mood: 'high-trust, professional, aspirational',
      aesthetic: 'Apple-inspired minimalism',
    },
    
    graphicDesign: {
      background: 'pure white or soft cream (#F9F6F0 to #FFFFFF)',
      lighting: 'bright diffused daylight, no harsh shadows, high-key',
      composition: 'centered product, 40% negative space, breathable',
    },
    
    promptEngineering: {
      style: 'studio product photography',
      keywords: [
        'professional studio photography',
        'clean white background',
        'Apple product launch aesthetic',
        'high-key lighting',
        'editorial quality',
        'premium minimalist',
        'corporate approved',
      ],
      quality: 'studio-quality, 8K clarity, professional color grading',
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PRESET 2: LIFESTYLE AUTHENTIC (Natural & Relatable)
  // ──────────────────────────────────────────────────────────────────────────
  'lifestyle-authentic': {
    id: 'lifestyle-authentic',
    name: 'Lifestyle Authentic',
    description: 'Natural, relatable, everyday workplace vibes with warm lighting',
    bestFor: ['Casual brands', 'Authentic storytelling', 'Service industries', 'Retail'],
    icon: '🌿',
    
    copywriting: {
      tone: 'friendly and conversational',
      formula: 'storytelling',
      style: 'approachable and warm',
    },
    
    creativeDirection: {
      concept: 'Authentic Workplace Moments',
      mood: 'welcoming, relatable, friendly',
      aesthetic: 'Instagram lifestyle photography',
    },
    
    graphicDesign: {
      background: 'real workplace environment (blurred bokeh)',
      lighting: 'warm natural window light, golden hour feel',
      composition: 'casual authentic moments, natural props',
    },
    
    promptEngineering: {
      style: 'lifestyle photography',
      keywords: [
        'lifestyle photography',
        'natural authentic feel',
        'warm golden hour lighting',
        'workplace authenticity',
        'Instagram aesthetic',
        'relatable moments',
        'soft bokeh background',
      ],
      quality: 'natural crisp daylight, professional but approachable',
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PRESET 3: BOLD IMPACT (High-Contrast, Attention-Grabbing)
  // ──────────────────────────────────────────────────────────────────────────
  'bold-impact': {
    id: 'bold-impact',
    name: 'Bold Impact',
    description: 'High-contrast, attention-grabbing, scroll-stopping design',
    bestFor: ['Urgent campaigns', 'Flash hiring', 'Limited-time offers', 'Competitive markets'],
    icon: '⚡',
    
    copywriting: {
      tone: 'urgent and action-oriented',
      formula: 'AIDA with urgency',
      style: 'bold and direct',
    },
    
    creativeDirection: {
      concept: 'Scroll-Stopping Impact',
      mood: 'urgent, exciting, can\'t-miss',
      aesthetic: 'Magazine cover boldness',
    },
    
    graphicDesign: {
      background: 'vibrant brand colors or high-contrast solid',
      lighting: 'dramatic, high-saturation, bright',
      composition: 'bold product fills 60% of frame, dynamic angle',
    },
    
    promptEngineering: {
      style: 'editorial photography',
      keywords: [
        'bold editorial photography',
        'high-contrast dramatic',
        'vibrant saturated colors',
        'attention-grabbing',
        'magazine cover quality',
        'scroll-stopping impact',
        'dynamic composition',
      ],
      quality: 'maximum saturation, crisp sharp edges, editorial-level',
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PRESET 4: CINEMATIC PREMIUM (Sophisticated & Prestige)
  // ──────────────────────────────────────────────────────────────────────────
  'cinematic-premium': {
    id: 'cinematic-premium',
    name: 'Cinematic Premium',
    description: 'Moody, sophisticated, prestige branding with cinematic lighting',
    bestFor: ['Premium positions', 'Luxury brands', 'Management roles', 'High-end retail'],
    icon: '🎬',
    
    copywriting: {
      tone: 'sophisticated and aspirational',
      formula: 'career elevation',
      style: 'prestigious and refined',
    },
    
    creativeDirection: {
      concept: 'Prestige Career Positioning',
      mood: 'aspirational, prestigious, elevated',
      aesthetic: 'Film noir cinematography',
    },
    
    graphicDesign: {
      background: 'dark or desaturated (#1A1A1A), spotlight on subject',
      lighting: 'cinematic single-source, controlled shadows, rim lights',
      composition: 'dramatic depth of field, artistic framing',
    },
    
    promptEngineering: {
      style: 'cinematic photography',
      keywords: [
        'cinematic photography',
        'film noir lighting',
        'moody sophisticated',
        'dramatic single-source light',
        'premium prestige branding',
        'film-quality depth of field',
        'emotional storytelling',
      ],
      quality: 'cinematic film quality, 4K clarity, professional color grading',
    },
  },
};

// ============================================================================
// PRESET HELPERS
// ============================================================================

/**
 * Get preset by ID (with fallback to 'none')
 */
export function getPreset(presetId: PresetName): Preset {
  return PRESETS[presetId] || PRESETS['none'];
}

/**
 * Get all preset options for UI selector
 */
export function getAllPresets(): Preset[] {
  return Object.values(PRESETS);
}

/**
 * Check if preset is 'none' (no constraints)
 */
export function isNonePreset(presetId: PresetName): boolean {
  return presetId === 'none';
}


