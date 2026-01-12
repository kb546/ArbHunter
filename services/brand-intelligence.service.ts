/**
 * BRAND INTELLIGENCE SYSTEM V2
 * 
 * Provides detailed brand information to AI agents for accurate,
 * on-brand creative generation
 * 
 * NEW: AI-powered brand detection for unlimited brand support
 */

import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  console.log('✅ OpenAI Brand Intelligence initialized');
} else {
  console.warn('⚠️  OPENAI_API_KEY not configured - brand detection limited to cache');
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BrandData {
  name: string;
  fullName: string;
  industry: string;
  logo: {
    description: string;
    placement: string;
    mustInclude: boolean;
  };
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background: string;
    text: string;
  };
  colorNames: {
    primary: string;
    secondary: string;
  };
  heroProduct: {
    name: string;
    description: string;
    visualDescription: string;
  };
  uniform?: {
    description: string;
    colors: string[];
    logoPlacement: string;
  };
  visualAssets: string[];
  brandVoice: {
    tone: string;
    style: string;
    keywords: string[];
  };
  typography: {
    style: string;
    weight: string;
  };
  competitors: string[];
  recruitmentContext?: {
    positions: string[];
    benefits: string[];
    ctaExamples: string[];
  };
}

// ============================================================================
// BRAND DATABASE
// ============================================================================

const BRAND_DATABASE: Record<string, BrandData> = {
  // ──────────────────────────────────────────────────────────────────────────
  // FAST FOOD / QSR
  // ──────────────────────────────────────────────────────────────────────────
  
  'kfc': {
    name: 'KFC',
    fullName: 'Kentucky Fried Chicken',
    industry: 'Fast Food / Quick Service Restaurant',
    logo: {
      description: 'Red and white KFC bucket logo with Colonel Sanders face, iconic red background with white "KFC" letters',
      placement: 'Top-left corner or centered prominently',
      mustInclude: true,
    },
    colors: {
      primary: '#E4002B',      // KFC Red
      secondary: '#FFFFFF',    // White
      accent: '#000000',       // Black
      background: '#FFFFFF',
      text: '#000000',
    },
    colorNames: {
      primary: 'KFC Red (#E4002B)',
      secondary: 'White',
    },
    heroProduct: {
      name: 'Original Recipe Chicken Bucket',
      description: '8-piece bucket of KFC\'s Original Recipe fried chicken',
      visualDescription: 'Iconic red and white striped KFC bucket filled with golden, crispy fried chicken pieces, steam rising, appetizing close-up, studio lighting',
    },
    uniform: {
      description: 'Red KFC-branded polo shirt or button-up with prominent KFC logo on chest, black or dark pants, name tag, optional red cap/visor with KFC mark.',
      colors: ['#E4002B', '#FFFFFF', '#000000'],
      logoPlacement: 'Left chest (shirt), optional cap front',
    },
    visualAssets: [
      'KFC bucket (red and white striped)',
      'Fried chicken pieces',
      'Colonel Sanders mascot or face',
      'KFC restaurant storefront',
      'Red and white brand colors',
    ],
    brandVoice: {
      tone: 'Friendly, welcoming, family-oriented',
      style: 'Bold, direct, appetizing',
      keywords: ['finger lickin\' good', 'join the team', 'weekly pay', 'free meals', 'start this week', 'flexible hours'],
    },
    typography: {
      style: 'Bold, sans-serif, high-impact',
      weight: 'Extra-bold for headlines, medium for body',
    },
    competitors: ['McDonald\'s', 'Burger King', 'Popeyes', 'Chick-fil-A'],
    recruitmentContext: {
      positions: ['Team Member', 'Cook', 'Cashier', 'Shift Supervisor', 'Assistant Manager', 'Delivery Driver'],
      benefits: ['Weekly Pay', 'Free Meals', 'Flexible Hours', 'Career Growth', 'Health Benefits', 'Employee Discounts'],
      ctaExamples: ['APPLY TODAY', 'JOIN KFC', 'START THIS WEEK', 'NOW HIRING', 'APPLY NOW'],
    },
  },

  'mcdonalds': {
    name: 'McDonald\'s',
    fullName: 'McDonald\'s Corporation',
    industry: 'Fast Food / Quick Service Restaurant',
    logo: {
      description: 'Iconic Golden Arches "M" logo in yellow, often on red background',
      placement: 'Prominently displayed, top-center or corner',
      mustInclude: true,
    },
    colors: {
      primary: '#FFC72C',      // McDonald's Yellow
      secondary: '#DA291C',    // McDonald's Red
      accent: '#FFFFFF',
      background: '#FFFFFF',
      text: '#000000',
    },
    colorNames: {
      primary: 'Golden Yellow (#FFC72C)',
      secondary: 'McDonald\'s Red (#DA291C)',
    },
    heroProduct: {
      name: 'Big Mac Meal',
      description: 'Iconic Big Mac burger with medium fries and drink',
      visualDescription: 'McDonald\'s Big Mac with two all-beef patties, special sauce, lettuce, cheese, pickles, onions on sesame seed bun, alongside golden french fries in red container, appetizing, studio lighting',
    },
    uniform: {
      description: 'Black polo with McDonald\'s Golden Arches logo, black visor or cap with logo, black pants, name tag',
      colors: ['#000000', '#FFC72C', '#DA291C'],
      logoPlacement: 'Left chest, visor front',
    },
    visualAssets: [
      'Golden Arches logo',
      'Big Mac',
      'French fries in red container',
      'Happy Meal box',
      'McDonald\'s storefront',
    ],
    brandVoice: {
      tone: 'Upbeat, inclusive, energetic',
      style: 'Modern, friendly, accessible',
      keywords: ['I\'m lovin\' it', 'join our crew', 'flexible schedule', 'education benefits', 'career opportunities'],
    },
    typography: {
      style: 'Bold, rounded sans-serif',
      weight: 'Bold for headlines',
    },
    competitors: ['KFC', 'Burger King', 'Wendy\'s', 'Taco Bell'],
    recruitmentContext: {
      positions: ['Crew Member', 'Cook', 'Cashier', 'Manager', 'Delivery Driver'],
      benefits: ['Flexible Hours', 'Education Benefits', 'Free Meals', 'Career Advancement', 'Health Insurance'],
      ctaExamples: ['APPLY TODAY', 'JOIN OUR CREW', 'NOW HIRING', 'START YOUR CAREER'],
    },
  },

  'dhl': {
    name: 'DHL',
    fullName: 'DHL Express',
    industry: 'Logistics / Courier',
    logo: {
      description: 'DHL logo with red and yellow colors, diagonal design, often with tagline "Excellence. Simply delivered."',
      placement: 'Top-left or centered, highly visible',
      mustInclude: true,
    },
    colors: {
      primary: '#FFCC00',      // DHL Yellow
      secondary: '#D40511',    // DHL Red
      accent: '#000000',
      background: '#FFFFFF',
      text: '#000000',
    },
    colorNames: {
      primary: 'DHL Yellow (#FFCC00)',
      secondary: 'DHL Red (#D40511)',
    },
    heroProduct: {
      name: 'DHL Express Package',
      description: 'DHL yellow and red branded delivery box/package',
      visualDescription: 'DHL express delivery box in signature yellow with red diagonal stripe, professional courier service aesthetic, clean studio shot',
    },
    uniform: {
      description: 'Bright yellow DHL polo shirt with red "DHL" logo prominently on chest and back, dark pants, yellow DHL cap or vest',
      colors: ['#FFCC00', '#D40511', '#000000'],
      logoPlacement: 'Chest, back, cap front',
    },
    visualAssets: [
      'DHL yellow delivery van',
      'DHL uniform (yellow and red)',
      'Packages with DHL logo',
      'DHL warehouse or facility',
      'Yellow and red brand colors',
    ],
    brandVoice: {
      tone: 'Professional, reliable, dynamic',
      style: 'Clear, direct, trustworthy',
      keywords: ['join our team', 'drivers needed', 'couriers', 'warehouse', 'full-time', 'part-time', 'competitive pay'],
    },
    typography: {
      style: 'Bold, sans-serif, professional',
      weight: 'Extra-bold for headlines',
    },
    competitors: ['FedEx', 'UPS', 'USPS', 'Amazon Logistics'],
    recruitmentContext: {
      positions: ['Delivery Driver', 'Courier', 'Warehouse Associate', 'Sorter', 'Operations Manager'],
      benefits: ['Competitive Pay', 'Full-Time', 'Part-Time', 'Health Benefits', 'Paid Training', 'Career Growth'],
      ctaExamples: ['APPLY TODAY', 'JOIN DHL', 'DRIVERS WANTED', 'NOW HIRING', 'START DRIVING'],
    },
  },

  'starbucks': {
    name: 'Starbucks',
    fullName: 'Starbucks Coffee Company',
    industry: 'Coffee / Food Service',
    logo: {
      description: 'Iconic green Starbucks Siren logo (mermaid in circle), white on green background',
      placement: 'Prominently centered or top-left',
      mustInclude: true,
    },
    colors: {
      primary: '#00704A',      // Starbucks Green
      secondary: '#FFFFFF',    // White
      accent: '#000000',
      background: '#FFFFFF',
      text: '#000000',
    },
    colorNames: {
      primary: 'Starbucks Green (#00704A)',
      secondary: 'White',
    },
    heroProduct: {
      name: 'Starbucks Coffee Cup',
      description: 'Iconic Starbucks cup with green logo and steaming coffee',
      visualDescription: 'Starbucks white cup with green siren logo, filled with coffee, steam rising, cozy atmosphere, studio lighting',
    },
    uniform: {
      description: 'Black or white shirt with Starbucks green accents, name tag, visor optional. Keep branding subtle and accurate.',
      colors: ['#00704A', '#FFFFFF', '#000000'],
      logoPlacement: 'Left chest (shirt) or small logo pin',
    },
    visualAssets: [
      'Starbucks Siren logo',
      'Coffee cup with logo',
      'Espresso machine',
      'Starbucks storefront',
    ],
    brandVoice: {
      tone: 'Warm, community-focused, inspiring',
      style: 'Friendly, inclusive, premium',
      keywords: ['join us', 'barista', 'coffee partners', 'benefits', 'education', 'community', 'career'],
    },
    typography: {
      style: 'Clean, modern sans-serif',
      weight: 'Bold for headlines, medium for body',
    },
    competitors: ['Dunkin\'', 'Costa Coffee', 'Peet\'s Coffee'],
    recruitmentContext: {
      positions: ['Barista', 'Shift Supervisor', 'Store Manager', 'Coffee Master'],
      benefits: ['Health Insurance', 'Stock Options', 'Free Coffee', 'Education Benefits (ASU)', 'Flexible Hours'],
      ctaExamples: ['JOIN US', 'BECOME A PARTNER', 'APPLY TODAY', 'BREW YOUR CAREER'],
    },
  },

  'amazon': {
    name: 'Amazon',
    fullName: 'Amazon.com, Inc.',
    industry: 'E-commerce / Logistics',
    logo: {
      description: 'Amazon logo with black text and orange smile arrow from A to Z',
      placement: 'Top-center or top-left, clearly visible',
      mustInclude: true,
    },
    colors: {
      primary: '#FF9900',      // Amazon Orange
      secondary: '#232F3E',    // Amazon Blue-Black
      accent: '#FFFFFF',
      background: '#FFFFFF',
      text: '#000000',
    },
    colorNames: {
      primary: 'Amazon Orange (#FF9900)',
      secondary: 'Dark Blue (#232F3E)',
    },
    heroProduct: {
      name: 'Amazon Prime Package',
      description: 'Amazon Prime delivery box with smile logo',
      visualDescription: 'Amazon cardboard box with iconic smile arrow logo, Amazon Prime tape, professional delivery service aesthetic',
    },
    uniform: {
      description: 'Amazon-branded blue vest with orange smile logo, or Amazon blue t-shirt with logo, safety shoes',
      colors: ['#232F3E', '#FF9900', '#FFFFFF'],
      logoPlacement: 'Chest, back of vest',
    },
    visualAssets: [
      'Amazon smile logo',
      'Amazon delivery van (blue with smile)',
      'Amazon warehouse',
      'Cardboard boxes with Amazon logo',
      'Prime logo',
    ],
    brandVoice: {
      tone: 'Innovative, customer-obsessed, driven',
      style: 'Modern, bold, aspirational',
      keywords: ['work hard', 'have fun', 'make history', '$15+ per hour', 'benefits', 'career growth', 'warehouse', 'delivery'],
    },
    typography: {
      style: 'Bold, modern sans-serif',
      weight: 'Bold',
    },
    competitors: ['Walmart', 'Target', 'eBay', 'FedEx'],
    recruitmentContext: {
      positions: ['Warehouse Associate', 'Delivery Driver', 'Picker', 'Packer', 'Sorter', 'Operations Manager'],
      benefits: ['$15+ Per Hour', 'Health Benefits', 'Career Choice Program', 'Paid Training', 'Bonuses'],
      ctaExamples: ['APPLY NOW', 'JOIN AMAZON', 'START TODAY', 'HIRING NOW', 'WORK AT AMAZON'],
    },
  },

  'walmart': {
    name: 'Walmart',
    fullName: 'Walmart Inc.',
    industry: 'Retail',
    logo: {
      description: 'Walmart logo with blue text and yellow spark/sunburst symbol',
      placement: 'Top-left or centered',
      mustInclude: true,
    },
    colors: {
      primary: '#0071CE',      // Walmart Blue
      secondary: '#FFC220',    // Walmart Yellow
      accent: '#FFFFFF',
      background: '#FFFFFF',
      text: '#000000',
    },
    colorNames: {
      primary: 'Walmart Blue (#0071CE)',
      secondary: 'Walmart Yellow (#FFC220)',
    },
    heroProduct: {
      name: 'Walmart Shopping Basket',
      description: 'Walmart shopping basket with products',
      visualDescription: 'Walmart blue and yellow branding, shopping basket or cart, everyday products, value-focused aesthetic',
    },
    uniform: {
      description: 'Blue Walmart vest with yellow spark logo, blue or white polo underneath, name tag, khaki or black pants',
      colors: ['#0071CE', '#FFC220', '#FFFFFF'],
      logoPlacement: 'Vest front and back',
    },
    visualAssets: [
      'Walmart spark logo',
      'Blue and yellow brand colors',
      'Walmart storefront',
      'Shopping cart',
      'Blue vest',
    ],
    brandVoice: {
      tone: 'Friendly, community-focused, value-driven',
      style: 'Approachable, clear, inclusive',
      keywords: ['save money', 'live better', 'join our team', 'benefits', 'flexible', 'careers'],
    },
    typography: {
      style: 'Bold, friendly sans-serif',
      weight: 'Bold for headlines',
    },
    competitors: ['Target', 'Costco', 'Amazon', 'Kroger'],
    recruitmentContext: {
      positions: ['Sales Associate', 'Cashier', 'Stocker', 'Department Manager', 'Pharmacy Tech'],
      benefits: ['Competitive Pay', 'Health Benefits', 'Employee Discount', 'Career Growth', '401k'],
      ctaExamples: ['APPLY TODAY', 'JOIN WALMART', 'NOW HIRING', 'WORK HERE', 'START YOUR CAREER'],
    },
  },
};

// ============================================================================
// BRAND DETECTION & RETRIEVAL
// ============================================================================

/**
 * Detects brand from niche/keyword input
 */
export function detectBrand(niche: string, geo?: string): BrandData | null {
  const nicheLower = niche.toLowerCase();
  
  // Direct brand name matches
  for (const [key, brand] of Object.entries(BRAND_DATABASE)) {
    if (
      nicheLower.includes(key) ||
      nicheLower.includes(brand.name.toLowerCase()) ||
      nicheLower.includes(brand.fullName.toLowerCase())
    ) {
      console.log(`✅ Brand detected: ${brand.name} from niche "${niche}"`);
      return brand;
    }
  }
  
  // Keyword-based detection
  if (nicheLower.includes('fast food') || nicheLower.includes('restaurant') || nicheLower.includes('burger')) {
    console.log(`⚠️ Generic fast food detected. Using KFC as default.`);
    return BRAND_DATABASE['kfc'];
  }
  
  if (nicheLower.includes('delivery') || nicheLower.includes('courier') || nicheLower.includes('logistics')) {
    console.log(`⚠️ Generic logistics detected. Using DHL as default.`);
    return BRAND_DATABASE['dhl'];
  }
  
  if (nicheLower.includes('coffee') || nicheLower.includes('barista') || nicheLower.includes('cafe')) {
    console.log(`⚠️ Generic coffee detected. Using Starbucks as default.`);
    return BRAND_DATABASE['starbucks'];
  }
  
  console.log(`⚠️ No brand detected from niche "${niche}". Returning null.`);
  return null;
}

/**
 * Gets brand by exact key
 */
export function getBrand(brandKey: string): BrandData | null {
  return BRAND_DATABASE[brandKey.toLowerCase()] || null;
}

/**
 * Gets all available brands
 */
export function getAllBrands(): string[] {
  return Object.keys(BRAND_DATABASE);
}

/**
 * Generates brand-specific prompt instructions for AI
 */
export function getBrandPromptInstructions(brand: BrandData): string {
  return `
BRAND REQUIREMENTS (CRITICAL - MUST FOLLOW):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Brand: ${brand.name} (${brand.fullName})

1. LOGO (MANDATORY):
   - ${brand.logo.description}
   - Placement: ${brand.logo.placement}
   - ${brand.logo.mustInclude ? '⚠️ MUST be clearly visible and recognizable' : 'Include if space allows'}

2. COLOR PALETTE (STRICT):
   - Primary: ${brand.colorNames.primary} - USE THIS AS DOMINANT COLOR
   - Secondary: ${brand.colorNames.secondary}
   - Background: ${brand.colors.background}
   - Text: ${brand.colors.text}
   - DO NOT use colors outside this palette

3. UNIFORM (if showing people):
   - ${brand.uniform?.description || 'Generic professional attire'}
   - Colors: ${brand.uniform?.colors.join(', ') || 'Standard professional'}
   - Logo placement: ${brand.uniform?.logoPlacement || 'Visible on chest'}

4. VISUAL ASSETS (include at least 2):
   ${brand.visualAssets.map(asset => `- ${asset}`).join('\n   ')}

5. BRAND VOICE:
   - Tone: ${brand.brandVoice.tone}
   - Style: ${brand.brandVoice.style}
   - Key phrases: ${brand.brandVoice.keywords.slice(0, 5).join(', ')}

6. TYPOGRAPHY:
   - Style: ${brand.typography.style}
   - Weight: ${brand.typography.weight}

${brand.recruitmentContext ? `
7. RECRUITMENT CONTEXT:
   - Positions: ${brand.recruitmentContext.positions.slice(0, 4).join(', ')}
   - Benefits: ${brand.recruitmentContext.benefits.slice(0, 4).join(', ')}
   - Example CTAs: ${brand.recruitmentContext.ctaExamples.slice(0, 3).join(', ')}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ VALIDATION: The output MUST include the ${brand.name} logo and use the exact brand colors specified above.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}

/**
 * Validates if generated creative meets brand requirements
 */
export function validateBrandAccuracy(
  prompt: string,
  brand: BrandData
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const promptLower = prompt.toLowerCase();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check logo mention
  if (brand.logo.mustInclude) {
    const logoMentioned = promptLower.includes(brand.name.toLowerCase()) || 
                         promptLower.includes('logo') ||
                         promptLower.includes(brand.fullName.toLowerCase());
    if (!logoMentioned) {
      errors.push(`Missing ${brand.name} logo reference in prompt`);
    }
  }
  
  // Check color mentions
  const colorMentioned = promptLower.includes(brand.colorNames.primary.toLowerCase()) ||
                        promptLower.includes('red') || promptLower.includes('yellow') ||
                        promptLower.includes('blue') || promptLower.includes('green');
  if (!colorMentioned) {
    warnings.push('No brand colors explicitly mentioned');
  }
  
  // Check uniform (if applicable)
  if (brand.uniform && promptLower.includes('uniform')) {
    const uniformMentioned = brand.uniform.colors.some(color => 
      promptLower.includes(color.toLowerCase())
    );
    if (!uniformMentioned) {
      warnings.push('Uniform mentioned but brand colors not specified');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// AI-POWERED BRAND DETECTION
// ============================================================================

export interface AIBrandDetectionResult {
  detected: boolean;
  confidence: number; // 0-100
  brandName?: string;
  fullName?: string;
  industry?: string;
  colors?: {
    primary: string;
    secondary: string;
    primaryName: string;
    secondaryName: string;
  };
  heroProduct?: {
    name: string;
    description: string;
    visualDescription: string;
  };
  logo?: {
    description: string;
    placement: string;
  };
  uniform?: {
    description: string;
    colors: string[];
  };
  competitors?: string[];
}

/**
 * AI-powered brand detection using GPT-4o
 * Detects brand information for ANY brand (not just the 6 in our cache)
 */
export async function detectBrandWithAI(
  niche: string,
  geo: string
): Promise<AIBrandDetectionResult> {
  if (!openai) {
    console.warn('⚠️ OpenAI not configured, brand detection unavailable');
    return { detected: false, confidence: 0 };
  }

  console.log(`\n🔍 AI Brand Detection for: "${niche}"`);

  const systemPrompt = `You are an elite brand intelligence expert with deep knowledge of thousands of global brands across all industries.

YOUR TASK:
Analyze the provided niche/business description and extract comprehensive brand information.

CRITICAL REQUIREMENTS:
1. Identify if this is a KNOWN BRAND (confidence > 70%) or UNKNOWN
2. Extract EXACT brand colors (HEX codes) - CRITICAL for brand accuracy
3. Identify the hero product (signature product/offering)
4. Describe the logo precisely
5. If recruitment campaign, describe typical uniform
6. Provide industry category

BRAND COLOR ACCURACY (CRITICAL):
- McDonald's: #FFC72C (Golden Yellow) + #DA291C (Red) ✅
- KFC: #E4002B (Red) + #FFFFFF (White) ✅
- Starbucks: #00704A (Green) + #FFFFFF (White) ✅
- Amazon: #FF9900 (Orange) + #232F3E (Dark Blue) ✅
- Walmart: #0071CE (Blue) + #FFC220 (Yellow) ✅
- DHL: #FFCC00 (Yellow) + #D40511 (Red) ✅

EXAMPLES:

Input: "KFC careers"
Output: {
  "detected": true,
  "confidence": 95,
  "brandName": "KFC",
  "fullName": "Kentucky Fried Chicken",
  "industry": "Fast Food / QSR",
  "colors": {
    "primary": "#E4002B",
    "secondary": "#FFFFFF",
    "primaryName": "KFC Red",
    "secondaryName": "White"
  },
  "heroProduct": {
    "name": "Original Recipe Chicken Bucket",
    "description": "8-piece bucket of crispy fried chicken",
    "visualDescription": "Iconic red and white striped KFC bucket filled with golden crispy chicken pieces, appetizing, studio lighting"
  },
  "logo": {
    "description": "Red and white KFC bucket logo with Colonel Sanders face",
    "placement": "Top-left corner"
  },
  "uniform": {
    "description": "Red KFC polo shirt with logo, black pants, name tag",
    "colors": ["#E4002B", "#FFFFFF", "#000000"]
  },
  "competitors": ["McDonald's", "Popeyes", "Burger King"]
}

Input: "Local pizza delivery jobs"
Output: {
  "detected": false,
  "confidence": 0,
  "industry": "Food Delivery / Local Restaurant"
}

OUTPUT FORMAT: JSON only, no markdown.`;

  const userMessage = `Analyze this business for brand detection:

Niche: "${niche}"
Geographic Market: ${geo}

Provide comprehensive brand intelligence in JSON format.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2, // Low for accuracy
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content?.trim() || '{}';
    const result: AIBrandDetectionResult = JSON.parse(content);

    const cost = (completion.usage?.prompt_tokens || 0) * 0.0025 / 1000 +
                 (completion.usage?.completion_tokens || 0) * 0.01 / 1000;

    console.log(`   Result: ${result.detected ? `✅ ${result.brandName} (${result.confidence}% confidence)` : '❌ Not a known brand'}`);
    console.log(`   Cost: $${cost.toFixed(4)}`);

    return result;
  } catch (error: any) {
    console.error('❌ AI Brand Detection failed:', error.message);
    return { detected: false, confidence: 0 };
  }
}

/**
 * Detect industry from niche keywords
 */
function detectIndustry(niche: string): string {
  const lower = niche.toLowerCase();
  
  if (/food|restaurant|pizza|burger|chicken|sandwich|fast.?food|qsr|cafe|coffee/i.test(lower)) {
    return 'Fast Food / QSR';
  }
  if (/delivery|courier|logistics|driver|shipping|transport/i.test(lower)) {
    return 'Logistics / Delivery';
  }
  if (/retail|store|shop|walmart|target|kroger|associate|cashier/i.test(lower)) {
    return 'Retail';
  }
  if (/ebt|snap|food.?stamp|medicaid|benefits|assistance|government/i.test(lower)) {
    return 'Government / Benefits';
  }
  if (/credit.?card|loan|insurance|finance|bank|mortgage/i.test(lower)) {
    return 'Finance / Credit';
  }
  
  return 'General';
}

/**
 * Generate industry-based smart defaults for unknown brands
 */
function generateIndustryDefaults(niche: string, detectedIndustry?: string): BrandData {
  const industry = detectedIndustry || detectIndustry(niche);
  
  const industryDefaults: Record<string, Partial<BrandData>> = {
    'Fast Food / QSR': {
      colors: { primary: '#E30613', secondary: '#FFD700', accent: '#FFFFFF', background: '#FFFFFF', text: '#000000' },
      colorNames: { primary: 'Red', secondary: 'Gold' },
      heroProduct: {
        name: 'Signature food item',
        description: 'Appetizing signature dish',
        visualDescription: 'Professional food photography, appetizing, studio lighting, clean background',
      },
    },
    'Retail': {
      colors: { primary: '#0071CE', secondary: '#FFC220', accent: '#FFFFFF', background: '#FFFFFF', text: '#000000' },
      colorNames: { primary: 'Blue', secondary: 'Yellow' },
      heroProduct: {
        name: 'Shopping experience',
        description: 'Diverse product selection',
        visualDescription: 'Shopping cart or basket with products, value-focused, clean retail environment',
      },
    },
    'Logistics / Delivery': {
      colors: { primary: '#FFCC00', secondary: '#D40511', accent: '#000000', background: '#FFFFFF', text: '#000000' },
      colorNames: { primary: 'Yellow', secondary: 'Red' },
      heroProduct: {
        name: 'Delivery package',
        description: 'Fast and reliable delivery',
        visualDescription: 'Branded package or delivery truck, professional courier aesthetic',
      },
    },
    'Government / Benefits': {
      colors: { primary: '#1E3A8A', secondary: '#10B981', accent: '#FFFFFF', background: '#FFFFFF', text: '#000000' },
      colorNames: { primary: 'Government Blue', secondary: 'Green' },
      heroProduct: {
        name: 'Benefit program',
        description: 'Financial assistance',
        visualDescription: 'Clean, trustworthy graphic with benefit amount, professional government aesthetic',
      },
    },
    'Finance / Credit': {
      colors: { primary: '#1E40AF', secondary: '#10B981', accent: '#FFFFFF', background: '#FFFFFF', text: '#000000' },
      colorNames: { primary: 'Trust Blue', secondary: 'Success Green' },
      heroProduct: {
        name: 'Credit card or financial product',
        description: 'Financial opportunity',
        visualDescription: 'Sleek credit card or financial graphic, premium aesthetic, trustworthy',
      },
    },
  };

  const defaults = industryDefaults[industry] || industryDefaults['Retail'];

  return {
    name: niche.split(' ')[0],
    fullName: niche,
    industry,
    logo: {
      description: 'Modern professional logo',
      placement: 'Top-left corner',
      mustInclude: false,
    },
    colors: defaults.colors!,
    colorNames: defaults.colorNames!,
    heroProduct: defaults.heroProduct!,
    visualAssets: [],
    brandVoice: {
      tone: 'Professional',
      style: 'Clear and trustworthy',
      keywords: [],
    },
    typography: {
      style: 'Clean sans-serif',
      weight: 'Bold',
    },
    competitors: [],
  };
}

/**
 * MAIN FUNCTION: Hybrid brand detection
 * 1. Check manual cache (fast, free)
 * 2. AI detection (for unknown brands)
 * 3. Industry defaults (fallback)
 */
export async function detectBrandV2(
  niche: string,
  geo: string
): Promise<BrandData> {
  console.log(`\n🔍 Brand Intelligence Pipeline`);
  console.log(`   Input: "${niche}" in ${geo}`);

  // Step 1: Check manual database (fast, free, cached)
  const nicheKey = niche.toLowerCase().replace(/\s+/g, '');
  for (const brandKey in BRAND_DATABASE) {
    if (nicheKey.includes(brandKey)) {
      console.log(`   ✅ Found in cache: ${BRAND_DATABASE[brandKey].fullName}`);
      return BRAND_DATABASE[brandKey];
    }
  }

  // Step 2: AI Detection (for unknown brands)
  const aiBrand = await detectBrandWithAI(niche, geo);

  if (aiBrand.detected && aiBrand.confidence >= 75 && aiBrand.colors) {
    console.log(`   ✅ AI detected brand: ${aiBrand.brandName}`);
    
    // Convert AI result to BrandData format
    const brandData: BrandData = {
      name: aiBrand.brandName!,
      fullName: aiBrand.fullName || aiBrand.brandName!,
      industry: aiBrand.industry || 'General',
      logo: {
        description: aiBrand.logo?.description || `${aiBrand.brandName} logo`,
        placement: aiBrand.logo?.placement || 'Top-left corner',
        mustInclude: true,
      },
      colors: {
        primary: aiBrand.colors.primary,
        secondary: aiBrand.colors.secondary,
        accent: aiBrand.colors.secondary,
        background: '#FFFFFF',
        text: '#000000',
      },
      colorNames: {
        primary: aiBrand.colors.primaryName,
        secondary: aiBrand.colors.secondaryName,
      },
      heroProduct: aiBrand.heroProduct || {
        name: `${aiBrand.brandName} signature product`,
        description: `Core offering of ${aiBrand.brandName}`,
        visualDescription: `Professional product shot of ${aiBrand.brandName}'s signature offering`,
      },
      uniform: aiBrand.uniform ? {
        ...aiBrand.uniform,
        logoPlacement: 'Left chest',
      } : undefined,
      visualAssets: [],
      brandVoice: {
        tone: 'Professional',
        style: 'Clear and engaging',
        keywords: [],
      },
      typography: {
        style: 'Clean sans-serif',
        weight: 'Bold',
      },
      competitors: aiBrand.competitors || [],
    };

    return brandData;
  }

  // Step 3: Industry-based smart defaults
  console.log(`   ℹ️  Using industry-based defaults`);
  return generateIndustryDefaults(niche, aiBrand.industry);
}

