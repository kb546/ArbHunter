/**
 * Copy Generation Service - AI-Powered Ad Copy
 * Uses OpenAI/Gemini/Claude to generate high-converting ad copy
 */

import type { 
  ToneOfVoice, 
  CopyFormula, 
  GeneratedCopy, 
  CopyGenerationRequest 
} from '@/types/creative-studio';

// ============================================================================
// AI PROVIDER CONFIGURATION
// ============================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ============================================================================
// COPY FORMULAS & TEMPLATES
// ============================================================================

const COPY_FORMULAS: Record<CopyFormula, { name: string; structure: string }> = {
  AIDA: {
    name: "Attention, Interest, Desire, Action",
    structure: "Hook → Build Interest → Create Desire → Call to Action",
  },
  PAS: {
    name: "Problem, Agitate, Solve",
    structure: "Identify Problem → Amplify Pain → Present Solution",
  },
  BAB: {
    name: "Before, After, Bridge",
    structure: "Current State → Desired State → How to Get There",
  },
  Custom: {
    name: "Custom Formula",
    structure: "Flexible structure optimized for the specific niche",
  },
};

const TONE_DESCRIPTORS: Record<ToneOfVoice, string> = {
  professional: "Polished, authoritative, credible, business-focused",
  casual: "Conversational, friendly, relatable, down-to-earth",
  urgent: "Time-sensitive, action-driving, bold, immediate",
  friendly: "Warm, approachable, helpful, supportive",
  authoritative: "Expert, commanding, trustworthy, confident",
};

// ============================================================================
// PROMPT ENGINEERING
// ============================================================================

function buildCopyPrompt(request: CopyGenerationRequest): string {
  const { 
    niche, 
    geo, 
    targetAudience, 
    toneOfVoice, 
    callToAction,
    adFormat,
    competitorInsights 
  } = request;

  const formula = selectBestFormula(niche, competitorInsights);
  const formulaStructure = COPY_FORMULAS[formula];
  const toneDescription = TONE_DESCRIPTORS[toneOfVoice];

  const competitorContext = competitorInsights 
    ? `Top competitors: ${competitorInsights.topAdvertisers.slice(0, 3).join(', ')}. Common themes: ${competitorInsights.commonThemes.slice(0, 3).join(', ')}.`
    : '';

  return `
You are an expert Facebook/Instagram ad copywriter specializing in high-converting social media ads.

**Campaign Details:**
- Niche: ${niche}
- Target Market: ${geo}
- Target Audience: ${targetAudience}
- Ad Format: ${adFormat}

**Copy Requirements:**
- Tone: ${toneOfVoice} (${toneDescription})
- Formula: ${formula} (${formulaStructure.structure})
- Call to Action: ${callToAction}

${competitorContext ? `**Market Context:**\n${competitorContext}` : ''}

**Instructions:**
1. Write ONE complete ad copy variation following the ${formula} formula
2. Create a compelling headline (max 40 characters)
3. Write engaging primary text (150-200 characters for optimal mobile display)
4. Add a short description (max 30 characters)
5. Include a landing page headline and body text
6. Suggest 3-5 relevant hashtags

**Guidelines:**
- Hook attention in the first 5 words
- Focus on benefits, not features
- Use power words and emotional triggers
- Create urgency without being pushy
- Match the ${toneOfVoice} tone consistently
- Optimize for mobile reading (short sentences, clear structure)
- Include specific outcomes the audience wants

**Response Format (JSON):**
{
  "headline": "Your 40-char headline",
  "primary_text": "Your 150-200 char primary text that hooks and converts",
  "description": "Your 30-char description",
  "call_to_action": "${callToAction}",
  "landing_page_headline": "Expanded headline for landing page",
  "landing_page_body": "2-3 paragraphs of persuasive landing page copy",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "estimated_ctr": 2.5,
  "engagement_score": 85,
  "reasoning": "Brief explanation of why this copy will perform well"
}

Generate the copy now.
`.trim();
}

/**
 * Select best copy formula based on niche
 */
function selectBestFormula(
  niche: string, 
  competitorInsights?: CopyGenerationRequest['competitorInsights']
): CopyFormula {
  const lowercaseNiche = niche.toLowerCase();

  // Problem-aware niches → PAS
  if (
    lowercaseNiche.includes('weight loss') ||
    lowercaseNiche.includes('debt') ||
    lowercaseNiche.includes('pain') ||
    lowercaseNiche.includes('anxiety')
  ) {
    return 'PAS';
  }

  // Transformation niches → BAB
  if (
    lowercaseNiche.includes('fitness') ||
    lowercaseNiche.includes('career') ||
    lowercaseNiche.includes('business') ||
    lowercaseNiche.includes('skill')
  ) {
    return 'BAB';
  }

  // Default to AIDA (most versatile)
  return 'AIDA';
}

// ============================================================================
// AI PROVIDERS
// ============================================================================

/**
 * Generate copy with OpenAI GPT-4
 */
async function generateWithOpenAI(prompt: string): Promise<Partial<GeneratedCopy>> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('🤖 Generating copy with OpenAI GPT-4...');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert ad copywriter. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    console.log('✅ OpenAI generation successful');
    return parsed;

  } catch (error: any) {
    console.error('❌ OpenAI generation failed:', error);
    throw error;
  }
}

/**
 * Generate copy with Google Gemini
 */
async function generateWithGemini(prompt: string): Promise<Partial<GeneratedCopy>> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  console.log('🤖 Generating copy with Google Gemini...');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt + '\n\nIMPORTANT: Respond with valid JSON only, no markdown formatting.',
            }],
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    // Clean potential markdown formatting
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanContent);

    console.log('✅ Gemini generation successful');
    return parsed;

  } catch (error: any) {
    console.error('❌ Gemini generation failed:', error);
    throw error;
  }
}

/**
 * Generate copy with Anthropic Claude
 */
async function generateWithClaude(prompt: string): Promise<Partial<GeneratedCopy>> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Claude API key not configured');
  }

  console.log('🤖 Generating copy with Claude...');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: prompt + '\n\nIMPORTANT: Respond with valid JSON only.',
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Clean potential markdown formatting
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanContent);

    console.log('✅ Claude generation successful');
    return parsed;

  } catch (error: any) {
    console.error('❌ Claude generation failed:', error);
    throw error;
  }
}

// ============================================================================
// MAIN SERVICE FUNCTION WITH FALLBACK
// ============================================================================

/**
 * Generate ad copy with automatic provider fallback
 */
export async function generateCopy(
  request: CopyGenerationRequest
): Promise<{ copies: Partial<GeneratedCopy>[]; totalCost: number }> {
  const { niche, geo, variations, toneOfVoice } = request;

  console.log(`\n📝 Starting copy generation:`);
  console.log(`   Niche: ${niche}`);
  console.log(`   GEO: ${geo}`);
  console.log(`   Tone: ${toneOfVoice}`);
  console.log(`   Variations: ${variations}`);

  const copies: Partial<GeneratedCopy>[] = [];
  let totalCost = 0;
  const costPerCopy = 0.01; // Estimated $0.01 per copy

  // Build prompt once
  const prompt = buildCopyPrompt(request);

  // Try each variation
  for (let i = 0; i < variations; i++) {
    console.log(`\n📝 Generating variation ${i + 1}/${variations}...`);

    try {
      let generatedCopy: Partial<GeneratedCopy> | null = null;

      // Try OpenAI first
      if (OPENAI_API_KEY && !generatedCopy) {
        try {
          generatedCopy = await generateWithOpenAI(prompt);
        } catch (error) {
          console.log('⚠️  OpenAI failed, trying Gemini...');
        }
      }

      // Try Gemini
      if (GEMINI_API_KEY && !generatedCopy) {
        try {
          generatedCopy = await generateWithGemini(prompt);
        } catch (error) {
          console.log('⚠️  Gemini failed, trying Claude...');
        }
      }

      // Try Claude
      if (ANTHROPIC_API_KEY && !generatedCopy) {
        try {
          generatedCopy = await generateWithClaude(prompt);
        } catch (error) {
          console.log('⚠️  Claude failed, using mock data...');
        }
      }

      // Fallback to mock
      if (!generatedCopy) {
        generatedCopy = getMockCopy(request, i);
      }

      // Add metadata
      const copy: Partial<GeneratedCopy> = {
        ...generatedCopy,
        copy_formula: selectBestFormula(niche, request.competitorInsights),
        tone_of_voice: toneOfVoice,
        is_favorite: false,
        generated_at: new Date().toISOString(),
      };

      copies.push(copy);
      totalCost += costPerCopy;

      // Add slight delay between generations to avoid rate limits
      if (i < variations - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error: any) {
      console.error(`❌ Failed to generate variation ${i + 1}:`, error);
      // Add mock copy as fallback
      copies.push(getMockCopy(request, i));
    }
  }

  console.log(`\n✅ Copy generation complete!`);
  console.log(`   Variations: ${copies.length}`);
  console.log(`   Total cost: $${totalCost.toFixed(4)}`);

  return { copies, totalCost };
}

// ============================================================================
// MOCK DATA (FOR DEVELOPMENT/FALLBACK)
// ============================================================================

function getMockCopy(request: CopyGenerationRequest, index: number): Partial<GeneratedCopy> {
  const { niche, callToAction, toneOfVoice, targetAudience } = request;

  const mockVariations = [
    {
      headline: `Transform Your ${niche} Today`,
      primary_text: `Tired of struggling with ${niche.toLowerCase()}? Our proven system helps ${targetAudience} achieve results in just 30 days. Join 10,000+ satisfied customers!`,
      description: `Get results in 30 days`,
    },
    {
      headline: `${niche}: The Easy Way`,
      primary_text: `What if ${niche.toLowerCase()} could be simple? Our step-by-step approach is designed for busy people who want real results without the hassle.`,
      description: `Simple, effective, proven`,
    },
    {
      headline: `Stop Wasting Money on ${niche}`,
      primary_text: `Most ${niche.toLowerCase()} solutions fail because they ignore one critical factor. We cracked the code, and now you can benefit. Limited spots available!`,
      description: `The smarter solution`,
    },
  ];

  const variation = mockVariations[index % mockVariations.length];

  return {
    headline: variation.headline,
    primary_text: variation.primary_text,
    description: variation.description,
    call_to_action: callToAction,
    landing_page_headline: `${variation.headline} - No Experience Required`,
    landing_page_body: `Whether you're just starting with ${niche.toLowerCase()} or looking to level up, our comprehensive solution provides everything you need.\n\nOur proven system has helped thousands of ${targetAudience} achieve their goals faster than they thought possible. With step-by-step guidance, expert support, and a thriving community, success is within reach.\n\nDon't wait another day. Start your transformation now and see why our customers rate us 4.8/5 stars.`,
    hashtags: [`#${niche.replace(/\s+/g, '')}`, '#Success', '#Transformation', '#Results'],
    copy_formula: selectBestFormula(niche),
    tone_of_voice: toneOfVoice,
    estimated_ctr: 2.3 + (Math.random() * 1.5),
    engagement_score: Math.floor(Math.random() * 15) + 75, // 75-90
    reasoning: `This copy uses the ${selectBestFormula(niche)} formula to create urgency and desire, with a ${toneOfVoice} tone that resonates with ${targetAudience}. The hook addresses a pain point, and the CTA creates clear next steps.`,
    is_favorite: false,
    generated_at: new Date().toISOString(),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { COPY_FORMULAS, TONE_DESCRIPTORS };


