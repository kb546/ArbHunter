/**
 * CREATIVE PRESETS SYSTEM
 * World-class creative direction inspired by Apple, Nike, Google campaigns
 * 
 * This system acts as a "Creative Director" that guides all AI agents
 * to produce high-quality, brand-accurate, conversion-optimized ads
 */

import type { CampaignType } from './campaign-type-detector.service';

// ============================================================================
// CREATIVE PRESET TYPES
// ============================================================================

export type CreativePreset = 
  | 'premium-minimal'     // Apple-inspired: Clean, premium, minimalist (DEFAULT - BEST)
  | 'bold-impact'         // Nike-inspired: Bold, energetic, action-oriented
  | 'friendly-trustworthy' // Google-inspired: Friendly, accessible, trustworthy
  | 'lifestyle-authentic'  // Patagonia-inspired: Real people, authentic moments
  | 'data-driven';         // Microsoft-inspired: Professional, data-focused, credible

export interface CreativePresetConfig {
  id: CreativePreset;
  name: string;
  description: string;
  inspiration: string;
  
  // Visual Direction
  visualPrinciples: {
    composition: string;
    whitespace: 'minimal' | 'balanced' | 'generous';
    colorApproach: string;
    photography: string;
    typography: string;
    brandPresence: string;
  };
  
  // Quality Standards
  qualityStandards: {
    imageResolution: string;
    brandAccuracy: string;
    visualClarity: string;
    textLegibility: string;
    professionalFinish: string;
  };
  
  // Copy Direction
  copyPrinciples: {
    tone: string;
    length: 'concise' | 'moderate' | 'detailed';
    emphasis: string;
    structure: string;
  };
  
  // Campaign Type Adaptations
  campaignTypeGuidance: Record<CampaignType, {
    visualFocus: string;
    keyElements: string[];
    avoid: string[];
    criticalSuccess: string;
  }>;
}

// ============================================================================
// PRESET DEFINITIONS
// ============================================================================

export const CREATIVE_PRESETS: Record<CreativePreset, CreativePresetConfig> = {
  // ──────────────────────────────────────────────────────────────────────────
  // PRESET 1: PREMIUM MINIMAL (DEFAULT - BEST OVERALL)
  // Inspiration: Apple, Tesla, Airbnb
  // ──────────────────────────────────────────────────────────────────────────
  'premium-minimal': {
    id: 'premium-minimal',
    name: 'Premium Minimal',
    description: 'Clean, elegant, premium aesthetic. Best for high-quality brands.',
    inspiration: 'Apple, Tesla, Airbnb',
    
    visualPrinciples: {
      composition: 'Centered, balanced, rule of thirds. Single focal point.',
      whitespace: 'generous',
      colorApproach: 'Restrained palette. Brand colors + white/black. High contrast.',
      photography: 'Studio quality, sharp focus, professional lighting, clean backgrounds',
      typography: 'Modern sans-serif, bold headlines, generous line spacing',
      brandPresence: 'Subtle but unmistakable. Logo prominent but not overwhelming.',
    },
    
    qualityStandards: {
      imageResolution: 'Minimum 8K equivalent, razor-sharp product shots',
      brandAccuracy: 'Exact brand colors (verified HEX), authentic logos, official products',
      visualClarity: 'Single clear message, no clutter, instant comprehension',
      textLegibility: 'High contrast text, large sizes, perfect kerning',
      professionalFinish: 'Magazine-quality, no artifacts, perfect color grading',
    },
    
    copyPrinciples: {
      tone: 'Confident, aspirational, simple',
      length: 'concise',
      emphasis: 'Benefits over features, emotional connection',
      structure: 'Headline (5-7 words) → Subheadline (8-12 words) → CTA (2-3 words)',
    },
    
    campaignTypeGuidance: {
      recruitment: {
        visualFocus: 'Hero product shot OR single employee in premium setting',
        keyElements: ['Clean uniform on premium hanger', 'Modern workspace', 'Brand logo (prominent)', 'High-end lighting'],
        avoid: ['Multiple people', 'Cluttered backgrounds', 'Generic stock photos', 'Busy compositions'],
        criticalSuccess: 'Makes the job feel premium and desirable, like joining an elite team',
      },
      free_sample: {
        visualFocus: 'Premium product shot, elevated sample packaging',
        keyElements: ['High-quality product photography', 'Clean packaging', '"FREE" in bold', 'Brand colors'],
        avoid: ['Cheap-looking graphics', 'Overcrowded layouts', 'Too many products'],
        criticalSuccess: 'Product looks valuable and desirable, not cheap or gimmicky',
      },
      government_program: {
        visualFocus: 'Clean, official aesthetic with human warmth',
        keyElements: ['Official colors (blue, white)', 'Clear benefit amount', 'Simple iconography', 'Trustworthy imagery'],
        avoid: ['Corporate coldness', 'Too much text', 'Stigmatizing visuals'],
        criticalSuccess: 'Feels official and trustworthy while being approachable',
      },
      credit_card: {
        visualFocus: 'Premium card render, sleek and modern',
        keyElements: ['High-quality card visual', 'Clear benefit callout', 'Trust indicators', 'Clean data viz'],
        avoid: ['Cluttered benefits list', 'Too salesy', 'Generic finance imagery'],
        criticalSuccess: 'Card looks premium and exclusive, benefits clear at a glance',
      },
      lead_gen: {
        visualFocus: 'Clean form/calculator visual, professional and simple',
        keyElements: ['Simple data visualization', 'Clear value prop', 'Trust signals', 'Minimal design'],
        avoid: ['Complex charts', 'Too much information', 'Aggressive sales tactics'],
        criticalSuccess: 'Process looks easy and valuable, low commitment feel',
      },
      trial_offer: {
        visualFocus: 'Premium product in aspirational setting',
        keyElements: ['Product in use', 'Clean lifestyle shot', 'Risk-free messaging', 'Premium feel'],
        avoid: ['Hard sell tactics', 'Cluttered features list', 'Cheap trial aesthetics'],
        criticalSuccess: 'Product looks premium enough to pay for, trial feels like a gift',
      },
      sweepstakes: {
        visualFocus: 'Premium prize visual, aspirational and exciting',
        keyElements: ['High-quality prize imagery', 'Clear prize value', 'Excitement without clutter', 'Brand colors'],
        avoid: ['Tacky lottery aesthetics', 'Too many elements', 'Cheap graphics'],
        criticalSuccess: 'Prize feels valuable and attainable, not scammy',
      },
      discount_sale: {
        visualFocus: 'Premium product with subtle urgency',
        keyElements: ['High-quality product shot', 'Clear discount', 'Elegant urgency cues', 'Brand integrity'],
        avoid: ['Desperate sale aesthetics', 'Too many products', 'Overwhelming text'],
        criticalSuccess: 'Sale feels exclusive and valuable, not desperate clearance',
      },
      product_launch: {
        visualFocus: 'Hero product shot, innovative and exciting',
        keyElements: ['Stunning product photography', 'Innovation cues', 'Clean backgrounds', 'Premium reveal aesthetic'],
        avoid: ['Generic "new" badges', 'Overhyped language', 'Cluttered features'],
        criticalSuccess: 'Product looks innovative and desirable, creates FOMO',
      },
      education: {
        visualFocus: 'Aspirational student success, clean and inspiring',
        keyElements: ['Successful students/graduates', 'Clear outcomes', 'Professional setting', 'Trust signals'],
        avoid: ['Generic classroom shots', 'Too academic', 'Boring stock photos'],
        criticalSuccess: 'Education feels transformative and achievable',
      },
      delivery_gig: {
        visualFocus: 'Real driver in premium vehicle/setting, aspirational freedom',
        keyElements: ['Authentic driver', 'Clean vehicle/setting', 'Earnings focus', 'Freedom imagery'],
        avoid: ['Generic delivery stock photos', 'Desperate hustler aesthetic', 'Cluttered benefits'],
        criticalSuccess: 'Opportunity feels professional and lucrative, not desperate gig work',
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PRESET 2: BOLD IMPACT
  // Inspiration: Nike, Red Bull, Supreme
  // ──────────────────────────────────────────────────────────────────────────
  'bold-impact': {
    id: 'bold-impact',
    name: 'Bold Impact',
    description: 'High-energy, bold, action-oriented. Best for activewear, energy brands.',
    inspiration: 'Nike, Red Bull, Supreme',
    
    visualPrinciples: {
      composition: 'Dynamic, asymmetric, diagonal lines. Action and movement.',
      whitespace: 'minimal',
      colorApproach: 'Vibrant brand colors, high saturation, bold contrasts',
      photography: 'Action shots, dramatic lighting, dynamic angles, motion blur',
      typography: 'Bold, oversized, impactful. All caps headlines.',
      brandPresence: 'Bold and prominent. Logo as power symbol.',
    },
    
    qualityStandards: {
      imageResolution: '8K action photography, crisp even in motion',
      brandAccuracy: 'Bold brand colors, iconic logos, signature products',
      visualClarity: 'Immediate impact, bold focal point, high energy',
      textLegibility: 'Massive text, ultra-high contrast, impossible to miss',
      professionalFinish: 'Sports magazine quality, dynamic color grading',
    },
    
    copyPrinciples: {
      tone: 'Motivational, urgent, empowering',
      length: 'concise',
      emphasis: 'Action, urgency, empowerment',
      structure: 'BOLD HEADLINE → Motivational subheadline → ACTION CTA',
    },
    
    campaignTypeGuidance: {
      recruitment: {
        visualFocus: 'Energetic team in action, bold brand presence',
        keyElements: ['Dynamic team photo', 'Bold colors', 'Action-oriented', 'Empowering messaging'],
        avoid: ['Static poses', 'Boring uniforms', 'Corporate stiffness'],
        criticalSuccess: 'Joining feels like joining a winning team',
      },
      free_sample: {
        visualFocus: 'Product bursting with energy, explosive reveal',
        keyElements: ['Dynamic product shot', 'Explosive graphics', 'Bold "FREE"', 'Action cues'],
        avoid: ['Static product shots', 'Passive messaging', 'Weak energy'],
        criticalSuccess: 'Sample feels exciting and valuable, creates urgency',
      },
      government_program: {
        visualFocus: 'Empowering people taking action, bold and hopeful',
        keyElements: ['Empowered individuals', 'Bold benefit callouts', 'Action-oriented', 'Hopeful energy'],
        avoid: ['Bureaucratic coldness', 'Passive recipients', 'Depressing imagery'],
        criticalSuccess: 'Program feels empowering, not charity',
      },
      credit_card: {
        visualFocus: 'Bold card with explosive rewards visualization',
        keyElements: ['Dynamic card reveal', 'Bold benefit numbers', 'Action-oriented rewards', 'High energy'],
        avoid: ['Corporate blandness', 'Boring card shots', 'Complex fine print'],
        criticalSuccess: 'Card feels powerful and rewarding',
      },
      lead_gen: {
        visualFocus: 'Bold CTA with dynamic value visualization',
        keyElements: ['Massive CTA', 'Bold value prop', 'Dynamic graphics', 'Urgency cues'],
        avoid: ['Passive forms', 'Boring calculators', 'Corporate dullness'],
        criticalSuccess: 'Taking action feels exciting and rewarding',
      },
      trial_offer: {
        visualFocus: 'Product in dynamic use, bold trial messaging',
        keyElements: ['Action product shot', 'Bold "FREE TRIAL"', 'Dynamic benefits', 'Energy and movement'],
        avoid: ['Static product shots', 'Boring trial offers', 'Low energy'],
        criticalSuccess: 'Trial feels exciting and risk-free',
      },
      sweepstakes: {
        visualFocus: 'Explosive prize reveal, maximum excitement',
        keyElements: ['Dynamic prize visual', 'Explosive graphics', 'Bold prize amount', 'Maximum energy'],
        avoid: ['Boring prize shots', 'Low energy', 'Corporate sweepstakes feel'],
        criticalSuccess: 'Entering feels exciting and urgent',
      },
      discount_sale: {
        visualFocus: 'Explosive sale with bold products and savings',
        keyElements: ['Dynamic product array', 'Bold discount numbers', 'Urgency elements', 'High energy'],
        avoid: ['Boring sale layouts', 'Weak urgency', 'Passive products'],
        criticalSuccess: 'Sale feels urgent and exciting, not desperate',
      },
      product_launch: {
        visualFocus: 'Explosive product reveal, maximum hype',
        keyElements: ['Dynamic product shot', 'Bold "NEW"', 'Explosive graphics', 'Hype energy'],
        avoid: ['Boring reveals', 'Generic new badges', 'Low energy'],
        criticalSuccess: 'Launch feels like a major event',
      },
      education: {
        visualFocus: 'Students in action, bold achievement messaging',
        keyElements: ['Dynamic student action', 'Bold outcomes', 'Empowering messaging', 'Success energy'],
        avoid: ['Boring classroom shots', 'Passive students', 'Academic dullness'],
        criticalSuccess: 'Education feels transformative and empowering',
      },
      delivery_gig: {
        visualFocus: 'Driver in action, bold earnings and freedom',
        keyElements: ['Dynamic driver action', 'Bold earnings numbers', 'Freedom imagery', 'High energy'],
        avoid: ['Static driver shots', 'Boring delivery imagery', 'Low energy'],
        criticalSuccess: 'Opportunity feels exciting and lucrative',
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PRESET 3: FRIENDLY TRUSTWORTHY
  // Inspiration: Google, Dropbox, Mailchimp
  // ──────────────────────────────────────────────────────────────────────────
  'friendly-trustworthy': {
    id: 'friendly-trustworthy',
    name: 'Friendly & Trustworthy',
    description: 'Approachable, warm, trustworthy. Best for tech, services, education.',
    inspiration: 'Google, Dropbox, Mailchimp',
    
    visualPrinciples: {
      composition: 'Balanced, friendly, approachable. Warm symmetry.',
      whitespace: 'balanced',
      colorApproach: 'Friendly brand colors, balanced saturation, warm tones',
      photography: 'Natural lighting, authentic moments, friendly faces, approachable settings',
      typography: 'Friendly sans-serif, moderate weight, warm feel',
      brandPresence: 'Friendly and welcoming. Logo feels like a friend.',
    },
    
    qualityStandards: {
      imageResolution: 'High-quality but natural, authentic feel',
      brandAccuracy: 'Accurate brand colors, friendly logo usage, authentic products',
      visualClarity: 'Clear and approachable, easy to understand',
      textLegibility: 'Friendly text hierarchy, comfortable reading',
      professionalFinish: 'Polished but natural, warm color grading',
    },
    
    copyPrinciples: {
      tone: 'Friendly, helpful, conversational',
      length: 'moderate',
      emphasis: 'Benefits and ease, helpful guidance',
      structure: 'Friendly headline → Helpful subheadline → Encouraging CTA',
    },
    
    campaignTypeGuidance: {
      recruitment: {
        visualFocus: 'Friendly team in natural setting, welcoming atmosphere',
        keyElements: ['Authentic team smiles', 'Natural workspace', 'Friendly brand presence', 'Welcoming vibe'],
        avoid: ['Corporate stiffness', 'Fake stock photo smiles', 'Cold environments'],
        criticalSuccess: 'Joining feels like joining a friendly, supportive team',
      },
      free_sample: {
        visualFocus: 'Friendly product presentation, warm and inviting',
        keyElements: ['Natural product shot', 'Warm colors', 'Friendly "free" messaging', 'Approachable design'],
        avoid: ['Aggressive sales tactics', 'Cold product shots', 'Pushy messaging'],
        criticalSuccess: 'Sample feels like a friendly gift, not a sales trap',
      },
      government_program: {
        visualFocus: 'Warm, helpful, accessible program visualization',
        keyElements: ['Friendly people helped', 'Warm colors', 'Clear simple benefits', 'Approachable design'],
        avoid: ['Bureaucratic coldness', 'Stigmatizing imagery', 'Complex forms'],
        criticalSuccess: 'Program feels helpful and accessible, not intimidating',
      },
      credit_card: {
        visualFocus: 'Friendly card presentation, approachable benefits',
        keyElements: ['Clean card visual', 'Clear simple benefits', 'Trustworthy imagery', 'Warm colors'],
        avoid: ['Corporate coldness', 'Complex terms', 'Intimidating finance imagery'],
        criticalSuccess: 'Card feels helpful and trustworthy, not predatory',
      },
      lead_gen: {
        visualFocus: 'Friendly invitation to engage, helpful and clear',
        keyElements: ['Simple clear form', 'Helpful value prop', 'Trust signals', 'Friendly design'],
        avoid: ['Aggressive capture tactics', 'Complex forms', 'Pushy sales feel'],
        criticalSuccess: 'Engaging feels helpful and low-pressure',
      },
      trial_offer: {
        visualFocus: 'Friendly product introduction, warm invitation',
        keyElements: ['Natural product usage', 'Friendly trial messaging', 'Clear benefits', 'Warm invitation'],
        avoid: ['Hard sell tactics', 'Commitment pressure', 'Cold product shots'],
        criticalSuccess: 'Trial feels like a friendly invitation, not a sales trap',
      },
      sweepstakes: {
        visualFocus: 'Friendly contest, warm and exciting',
        keyElements: ['Approachable prize visual', 'Friendly excitement', 'Clear rules', 'Warm design'],
        avoid: ['Scammy aesthetics', 'Aggressive entry tactics', 'Cold contest feel'],
        criticalSuccess: 'Contest feels fun and trustworthy, not predatory',
      },
      discount_sale: {
        visualFocus: 'Friendly sale, helpful savings',
        keyElements: ['Natural product shots', 'Clear savings', 'Helpful tone', 'Warm design'],
        avoid: ['Desperate sale tactics', 'Aggressive urgency', 'Cold discount messaging'],
        criticalSuccess: 'Sale feels like helpful savings, not desperate clearance',
      },
      product_launch: {
        visualFocus: 'Friendly product introduction, warm excitement',
        keyElements: ['Natural product reveal', 'Friendly excitement', 'Clear value', 'Approachable design'],
        avoid: ['Overhyped launch', 'Corporate coldness', 'Aggressive FOMO'],
        criticalSuccess: 'Launch feels exciting but approachable',
      },
      education: {
        visualFocus: 'Friendly learning environment, supportive atmosphere',
        keyElements: ['Authentic students', 'Supportive environment', 'Clear outcomes', 'Warm welcoming feel'],
        avoid: ['Corporate education feel', 'Intimidating academics', 'Cold classrooms'],
        criticalSuccess: 'Education feels supportive and achievable',
      },
      delivery_gig: {
        visualFocus: 'Friendly driver, approachable opportunity',
        keyElements: ['Authentic friendly driver', 'Clear earnings', 'Supportive messaging', 'Warm opportunity feel'],
        avoid: ['Corporate coldness', 'Desperate hustle feel', 'Intimidating requirements'],
        criticalSuccess: 'Opportunity feels friendly and achievable',
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PRESET 4: LIFESTYLE AUTHENTIC
  // Inspiration: Patagonia, REI, Allbirds
  // ──────────────────────────────────────────────────────────────────────────
  'lifestyle-authentic': {
    id: 'lifestyle-authentic',
    name: 'Lifestyle Authentic',
    description: 'Real people, authentic moments, genuine stories. Best for lifestyle brands.',
    inspiration: 'Patagonia, REI, Allbirds',
    
    visualPrinciples: {
      composition: 'Natural, candid, real moments. Rule of thirds.',
      whitespace: 'balanced',
      colorApproach: 'Natural colors, authentic tones, real-world palette',
      photography: 'Documentary style, natural lighting, real people, authentic moments',
      typography: 'Natural, readable, authentic. Not overly designed.',
      brandPresence: 'Subtle and authentic. Brand is part of the story.',
    },
    
    qualityStandards: {
      imageResolution: 'High-quality but natural, documentary feel',
      brandAccuracy: 'Authentic brand usage in real contexts',
      visualClarity: 'Clear story, authentic moment, real connection',
      textLegibility: 'Natural text placement, does not interrupt authenticity',
      professionalFinish: 'Documentary quality, natural color grading',
    },
    
    copyPrinciples: {
      tone: 'Authentic, genuine, personal',
      length: 'moderate',
      emphasis: 'Real stories, genuine benefits, authentic experiences',
      structure: 'Authentic headline → Real story → Genuine invitation',
    },
    
    campaignTypeGuidance: {
      recruitment: {
        visualFocus: 'Real employees in authentic work moments',
        keyElements: ['Candid work moments', 'Real employees', 'Authentic workspace', 'Genuine interactions'],
        avoid: ['Staged corporate shots', 'Fake smiles', 'Overly polished imagery'],
        criticalSuccess: 'Joining feels like joining real people doing real work',
      },
      free_sample: {
        visualFocus: 'Product in real use, authentic context',
        keyElements: ['Real product usage', 'Authentic context', 'Genuine benefit', 'Natural presentation'],
        avoid: ['Staged product shots', 'Artificial settings', 'Overly promotional'],
        criticalSuccess: 'Sample feels like trying something genuinely good',
      },
      government_program: {
        visualFocus: 'Real people helped, authentic stories',
        keyElements: ['Real beneficiaries', 'Authentic improvements', 'Genuine stories', 'Natural presentation'],
        avoid: ['Staged charity shots', 'Pitying imagery', 'Overly promotional'],
        criticalSuccess: 'Program feels like real help for real people',
      },
      credit_card: {
        visualFocus: 'Real financial improvement, authentic usage',
        keyElements: ['Real usage scenarios', 'Authentic benefits', 'Genuine improvements', 'Natural context'],
        avoid: ['Staged wealth imagery', 'Artificial luxury', 'Fake lifestyles'],
        criticalSuccess: 'Card feels like genuine financial tool, not false promises',
      },
      lead_gen: {
        visualFocus: 'Real value exchange, authentic consultation',
        keyElements: ['Real consultation', 'Authentic value', 'Genuine help', 'Natural interaction'],
        avoid: ['Staged sales scenarios', 'Fake testimonials', 'Artificial setups'],
        criticalSuccess: 'Engaging feels like genuine help, not sales trap',
      },
      trial_offer: {
        visualFocus: 'Real product experience, authentic trial',
        keyElements: ['Real product use', 'Authentic experience', 'Genuine benefits', 'Natural trial context'],
        avoid: ['Staged product demos', 'Fake enthusiasm', 'Artificial perfection'],
        criticalSuccess: 'Trial feels like real opportunity to experience genuine product',
      },
      sweepstakes: {
        visualFocus: 'Real winners, authentic excitement',
        keyElements: ['Real winner moments', 'Authentic excitement', 'Genuine prizes', 'Natural celebration'],
        avoid: ['Staged winner shots', 'Fake excitement', 'Artificial prize imagery'],
        criticalSuccess: 'Contest feels genuine and attainable',
      },
      discount_sale: {
        visualFocus: 'Real value, authentic savings',
        keyElements: ['Real products', 'Authentic savings', 'Genuine value', 'Natural presentation'],
        avoid: ['Staged sale imagery', 'Artificial urgency', 'Fake scarcity'],
        criticalSuccess: 'Sale feels like genuine value, not manipulative tactics',
      },
      product_launch: {
        visualFocus: 'Real product in authentic use, genuine innovation',
        keyElements: ['Real product usage', 'Authentic innovation', 'Genuine benefits', 'Natural reveal'],
        avoid: ['Overhyped staging', 'Artificial perfection', 'Fake enthusiasm'],
        criticalSuccess: 'Launch feels like genuine innovation, not just marketing hype',
      },
      education: {
        visualFocus: 'Real students, authentic learning journeys',
        keyElements: ['Real student stories', 'Authentic learning', 'Genuine outcomes', 'Natural education moments'],
        avoid: ['Staged graduation shots', 'Fake success stories', 'Artificial perfection'],
        criticalSuccess: 'Education feels like real transformation',
      },
      delivery_gig: {
        visualFocus: 'Real drivers, authentic work experience',
        keyElements: ['Real driver stories', 'Authentic work moments', 'Genuine flexibility', 'Natural work scenes'],
        avoid: ['Staged hustle shots', 'Fake earnings claims', 'Artificial perfection'],
        criticalSuccess: 'Opportunity feels like real work with real benefits',
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PRESET 5: DATA DRIVEN
  // Inspiration: Microsoft, IBM, LinkedIn
  // ──────────────────────────────────────────────────────────────────────────
  'data-driven': {
    id: 'data-driven',
    name: 'Data Driven',
    description: 'Professional, credible, data-focused. Best for B2B, financial, enterprise.',
    inspiration: 'Microsoft, IBM, LinkedIn',
    
    visualPrinciples: {
      composition: 'Structured, grid-based, organized. Professional symmetry.',
      whitespace: 'balanced',
      colorApproach: 'Professional brand colors, corporate palette, credible tones',
      photography: 'Professional settings, business contexts, clean environments',
      typography: 'Professional serif/sans, credible hierarchy, business feel',
      brandPresence: 'Professional and credible. Logo signals expertise.',
    },
    
    qualityStandards: {
      imageResolution: 'Corporate photography quality, professional finish',
      brandAccuracy: 'Exact brand guidelines, professional logo usage',
      visualClarity: 'Clear data, professional presentation, credible information',
      textLegibility: 'Professional hierarchy, business-grade readability',
      professionalFinish: 'Corporate brochure quality, professional color grading',
    },
    
    copyPrinciples: {
      tone: 'Professional, credible, informative',
      length: 'detailed',
      emphasis: 'Data, proof points, credibility',
      structure: 'Professional headline → Data-backed subheadline → Clear CTA',
    },
    
    campaignTypeGuidance: {
      recruitment: {
        visualFocus: 'Professional work environment, career data',
        keyElements: ['Professional workspace', 'Career data', 'Clear opportunities', 'Business environment'],
        avoid: ['Casual environments', 'Emotional appeals', 'Non-professional imagery'],
        criticalSuccess: 'Joining feels like professional career move',
      },
      free_sample: {
        visualFocus: 'Professional product presentation, value data',
        keyElements: ['Professional product shot', 'Clear value data', 'Credible offer', 'Business presentation'],
        avoid: ['Emotional appeals', 'Casual imagery', 'Vague benefits'],
        criticalSuccess: 'Sample feels like professional trial, backed by data',
      },
      government_program: {
        visualFocus: 'Official program data, professional presentation',
        keyElements: ['Clear program data', 'Official presentation', 'Credible statistics', 'Professional design'],
        avoid: ['Emotional manipulation', 'Vague promises', 'Unprofessional imagery'],
        criticalSuccess: 'Program feels official and data-backed',
      },
      credit_card: {
        visualFocus: 'Financial data, professional card presentation',
        keyElements: ['Clear financial benefits', 'Data-backed value', 'Professional card visual', 'Credible information'],
        avoid: ['Emotional appeals', 'Vague promises', 'Unprofessional presentation'],
        criticalSuccess: 'Card feels like smart financial decision backed by data',
      },
      lead_gen: {
        visualFocus: 'Professional value proposition, clear data',
        keyElements: ['Clear ROI data', 'Professional presentation', 'Credible value prop', 'Business context'],
        avoid: ['Emotional manipulation', 'Vague benefits', 'Casual approach'],
        criticalSuccess: 'Engaging feels like professional business decision',
      },
      trial_offer: {
        visualFocus: 'Professional product trial, data-backed benefits',
        keyElements: ['Clear trial terms', 'Professional product', 'Data-backed benefits', 'Business presentation'],
        avoid: ['Emotional appeals', 'Vague trial terms', 'Casual presentation'],
        criticalSuccess: 'Trial feels like professional evaluation opportunity',
      },
      sweepstakes: {
        visualFocus: 'Professional contest, clear data and rules',
        keyElements: ['Clear contest data', 'Professional presentation', 'Transparent rules', 'Credible prizes'],
        avoid: ['Emotional manipulation', 'Vague rules', 'Unprofessional imagery'],
        criticalSuccess: 'Contest feels professional and transparent',
      },
      discount_sale: {
        visualFocus: 'Professional sale, clear savings data',
        keyElements: ['Clear discount data', 'Professional product', 'Data-backed value', 'Business presentation'],
        avoid: ['Emotional urgency', 'Vague savings', 'Desperate tactics'],
        criticalSuccess: 'Sale feels like smart business decision',
      },
      product_launch: {
        visualFocus: 'Professional product reveal, innovation data',
        keyElements: ['Clear innovation data', 'Professional product', 'Data-backed benefits', 'Business presentation'],
        avoid: ['Emotional hype', 'Vague innovation claims', 'Casual reveal'],
        criticalSuccess: 'Launch feels like significant professional innovation',
      },
      education: {
        visualFocus: 'Professional outcomes data, career statistics',
        keyElements: ['Clear outcome data', 'Professional presentation', 'Career statistics', 'ROI information'],
        avoid: ['Emotional appeals', 'Vague promises', 'Casual education imagery'],
        criticalSuccess: 'Education feels like data-backed career investment',
      },
      delivery_gig: {
        visualFocus: 'Professional opportunity, clear earnings data',
        keyElements: ['Clear earnings data', 'Professional presentation', 'Real statistics', 'Business opportunity'],
        avoid: ['Emotional appeals', 'Vague earnings', 'Casual hustle imagery'],
        criticalSuccess: 'Opportunity feels like professional business decision',
      },
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get default preset (best overall)
 */
export function getDefaultPreset(): CreativePreset {
  return 'premium-minimal'; // Apple-inspired, works for everything
}

/**
 * Get preset configuration
 */
export function getPresetConfig(preset: CreativePreset): CreativePresetConfig {
  return CREATIVE_PRESETS[preset];
}

/**
 * Get all available presets
 */
export function getAllPresets(): CreativePresetConfig[] {
  return Object.values(CREATIVE_PRESETS);
}

/**
 * Get preset for specific campaign type (auto-selects best preset)
 */
export function getRecommendedPreset(campaignType: CampaignType): CreativePreset {
  const recommendations: Partial<Record<CampaignType, CreativePreset>> = {
    recruitment: 'premium-minimal',
    free_sample: 'premium-minimal',
    government_program: 'friendly-trustworthy',
    credit_card: 'premium-minimal',
    lead_gen: 'data-driven',
    trial_offer: 'premium-minimal',
    sweepstakes: 'bold-impact',
    discount_sale: 'bold-impact',
    product_launch: 'premium-minimal',
    education: 'friendly-trustworthy',
    delivery_gig: 'lifestyle-authentic',
  };
  
  return recommendations[campaignType] || 'premium-minimal';
}

/**
 * Get preset guidance for specific campaign type
 */
export function getPresetGuidance(preset: CreativePreset, campaignType: CampaignType) {
  const config = CREATIVE_PRESETS[preset];
  return config.campaignTypeGuidance[campaignType];
}
