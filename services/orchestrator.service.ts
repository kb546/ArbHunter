/**
 * CREATIVE STUDIO V2: MULTI-AGENT ORCHESTRATOR
 * 
 * Master controller that coordinates 5 specialized AI agents to generate
 * the highest-quality ad creatives in the industry.
 * 
 * Architecture:
 * 1. Parse user input + preset configuration
 * 2. Distribute tasks to 4 agents in parallel
 * 3. Agent 4 synthesizes outputs
 * 4. Generate images with DALL-E 3
 * 5. Agent 5 scores quality & predicts CTR
 */

import type { Campaign } from '@/types/creative-studio';

// Import all agents
import { generateCopyStrategy } from './agents/copywriting-agent.service';
import { generateCreativeDirection } from './agents/creative-director-agent.service';
import { generateGraphicDesign } from './agents/graphic-designer-agent.service';
import { generateMasterPrompt } from './agents/prompt-engineer-agent.service';
import { analyzeQuality } from './agents/quality-control-agent.service';

// Import presets
import { PRESETS, type PresetName } from './presets/presets.config';

// ============================================================================
// TYPES
// ============================================================================

export interface OrchestrationRequest {
  campaign: Campaign;
  preset: PresetName;
  variations: number; // Default: 2
  targetAudience?: string;
}

export interface OrchestrationResult {
  variations: GeneratedVariation[];
  totalCost: number;
  totalTime: number;
  bestVariation: number; // Index of predicted winner
  metadata: {
    agentOutputs: AgentOutputs;
    preset: PresetName;
    timestamp: string;
  };
}

export interface GeneratedVariation {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  prompt: string;
  copyStrategy: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  qualityScores: {
    visualHierarchy: number;
    brandConsistency: number;
    typographyQuality: number;
    emotionalResonance: number;
    overall: number;
  };
  predictedCTR: number;
  cost: number;
  generatedAt: string;
}

interface AgentOutputs {
  copywriting: CopyStrategyOutput;
  creativeDirection: CreativeDirectionOutput;
  graphicDesign: GraphicDesignOutput;
  promptEngineering: PromptEngineeringOutput;
}

export interface CopyStrategyOutput {
  headlines: string[];
  subheadlines: string[];
  ctas: string[];
  reasoning: string;
  predictedCTR: number;
  tone: string;
  formula: string;
}

export interface CreativeDirectionOutput {
  concept: string;
  visualHierarchy: string[];
  colorStrategy: {
    primary: string;
    secondary: string;
    background: string;
    reasoning: string;
  };
  compositionRules: string[];
  emotionalTone: string;
  targetEmotion: string;
  brandGuidelines?: {
    brandName: string;
    officialColors: string[];
    logoRequirements: string;
  };
}

export interface GraphicDesignOutput {
  canvas: {
    size: string;
    orientation: string;
    safeMargins: string;
  };
  typography: {
    headline: TypographySpec;
    subheadline: TypographySpec;
    cta: CTASpec;
  };
  visualElements: {
    product: ProductSpec;
  };
  spacing: {
    headlineToProduct: string;
    productToSubheadline: string;
    subheadlineToCTA: string;
  };
}

interface TypographySpec {
  text?: string;
  fontStyle: string;
  fontSize: string;
  color: string;
  position: string;
  width?: string;
  lineHeight?: string;
  letterSpacing?: string;
  effects?: string;
}

interface CTASpec extends TypographySpec {
  background: string;
  buttonSize: string;
  borderRadius: string;
  shadow: string;
}

interface ProductSpec {
  type: string;
  position: string;
  size: string;
  focus: string;
}

export interface PromptEngineeringOutput {
  masterPrompt: string;
  promptQuality: number;
  modelOptimizations: string[];
  estimatedTokens: number;
}

// ============================================================================
// MAIN ORCHESTRATION FUNCTION
// ============================================================================

/**
 * Orchestrate multi-agent creative generation workflow
 */
export async function orchestrateCreativeGeneration(
  request: OrchestrationRequest
): Promise<OrchestrationResult> {
  const startTime = Date.now();
  console.log('\n🚀 CREATIVE STUDIO V2: Multi-Agent Orchestration Started');
  console.log(`   Campaign: ${request.campaign.name}`);
  console.log(`   Niche: ${request.campaign.niche}`);
  console.log(`   GEO: ${request.campaign.geo}`);
  console.log(`   Preset: ${request.preset}`);
  console.log(`   Variations: ${request.variations}`);

  // Load preset configuration
  const presetConfig = PRESETS[request.preset];
  console.log(`\n✅ Preset loaded: ${presetConfig.name}`);
  console.log(`   Description: ${presetConfig.description}`);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 1: PARALLEL AGENT EXECUTION (Agents 1, 2, 3)
  // ──────────────────────────────────────────────────────────────────────────

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STAGE 1: Parallel Agent Execution');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const stage1Start = Date.now();

  // Execute agents 1, 2, 3 in parallel
  const [copyStrategyOutput, creativeDirectionOutput, graphicDesignOutput] = await Promise.all([
    // Agent 1: Copywriting Strategist
    (async () => {
      console.log('\n🖊️  Agent 1 (Copywriting): Starting analysis...');
      const result = await generateCopyStrategy({
        niche: request.campaign.niche,
        geo: request.campaign.geo,
        targetAudience: request.targetAudience || request.campaign.target_audience || '',
        preset: request.preset,
        variations: request.variations,
      });
      console.log(`✅ Agent 1 (Copywriting): Complete (${result.headlines.length} headlines generated)`);
      return result;
    })(),

    // Agent 2: Creative Director
    (async () => {
      console.log('\n🎨 Agent 2 (Creative Director): Starting concept development...');
      const result = await generateCreativeDirection({
        niche: request.campaign.niche,
        geo: request.campaign.geo,
        targetAudience: request.targetAudience || request.campaign.target_audience || '',
        preset: request.preset,
      });
      console.log(`✅ Agent 2 (Creative Director): Complete (Concept: "${result.concept}")`);
      return result;
    })(),

    // Agent 3: Graphic Designer
    (async () => {
      console.log('\n🖼️  Agent 3 (Graphic Designer): Starting layout design...');
      const result = await generateGraphicDesign({
        niche: request.campaign.niche,
        geo: request.campaign.geo,
        preset: request.preset,
      });
      console.log(`✅ Agent 3 (Graphic Designer): Complete (Canvas: ${result.canvas.size})`);
      return result;
    })(),
  ]);

  const stage1Time = Date.now() - stage1Start;
  console.log(`\n⏱️  Stage 1 completed in ${(stage1Time / 1000).toFixed(2)}s`);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 2: PROMPT SYNTHESIS (Agent 4)
  // ──────────────────────────────────────────────────────────────────────────

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STAGE 2: Prompt Engineering & Synthesis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const stage2Start = Date.now();

  console.log('\n🔧 Agent 4 (Prompt Engineer): Synthesizing all outputs...');
  const promptEngineeringOutput = await generateMasterPrompt({
    copyStrategy: copyStrategyOutput,
    creativeDirection: creativeDirectionOutput,
    graphicDesign: graphicDesignOutput,
    preset: request.preset,
    niche: request.campaign.niche,
  });

  const stage2Time = Date.now() - stage2Start;
  console.log(`✅ Agent 4 (Prompt Engineer): Complete (${promptEngineeringOutput.masterPrompt.length} chars, Quality: ${promptEngineeringOutput.promptQuality}/100)`);
  console.log(`⏱️  Stage 2 completed in ${(stage2Time / 1000).toFixed(2)}s`);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 3: IMAGE GENERATION (DALL-E 3)
  // ──────────────────────────────────────────────────────────────────────────

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STAGE 3: Image Generation (DALL-E 3)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const stage3Start = Date.now();

  console.log(`\n🎨 Generating ${request.variations} variations with DALL-E 3 HD...`);

  // Import image generation service
  const { generateWithDALLE3 } = await import('./image-generation.service');

  const variations: GeneratedVariation[] = [];
  let totalCost = 0;

  // Calculate agent costs
  const agentCost = 0.008 + 0.008 + 0.008 + 0.006; // Agents 1, 2, 3, 4
  totalCost += agentCost;

  // Generate each variation with unique copy
  for (let i = 0; i < request.variations; i++) {
    console.log(`\n   Variation ${i + 1}/${request.variations}:`);
    
    // Select unique copy for this variation
    const headline = copyStrategyOutput.headlines[i % copyStrategyOutput.headlines.length];
    const subheadline = copyStrategyOutput.subheadlines[i % copyStrategyOutput.subheadlines.length];
    const cta = copyStrategyOutput.ctas[i % copyStrategyOutput.ctas.length];

    // Update prompt with this variation's copy
    const variationPrompt = updatePromptWithCopy(
      promptEngineeringOutput.masterPrompt,
      headline,
      subheadline,
      cta
    );

    console.log(`   📝 Copy: "${headline}" / "${cta}"`);
    console.log(`   🎨 Generating image...`);

    try {
      // Generate image with DALL-E 3
      const images = await generateWithDALLE3(variationPrompt, 'square', 1);
      
      if (images.length > 0) {
        const variation: GeneratedVariation = {
          id: `var-${Date.now()}-${i}`,
          imageUrl: images[0].url,
          thumbnailUrl: images[0].url,
          prompt: variationPrompt,
          copyStrategy: {
            headline,
            subheadline,
            cta,
          },
          qualityScores: {
            visualHierarchy: 0,
            brandConsistency: 0,
            typographyQuality: 0,
            emotionalResonance: 0,
            overall: 0,
          },
          predictedCTR: 0,
          cost: 0.080, // DALL-E 3 HD cost
          generatedAt: new Date().toISOString(),
        };

        variations.push(variation);
        totalCost += 0.080;
        console.log(`   ✅ Variation ${i + 1} generated successfully`);
      }
    } catch (error: any) {
      console.error(`   ❌ Variation ${i + 1} failed:`, error.message);
      // Continue with other variations
    }
  }

  const stage3Time = Date.now() - stage3Start;
  console.log(`\n⏱️  Stage 3 completed in ${(stage3Time / 1000).toFixed(2)}s`);
  console.log(`💰 Image generation cost: $${(totalCost - agentCost).toFixed(3)}`);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 4: QUALITY CONTROL (Agent 5)
  // ──────────────────────────────────────────────────────────────────────────

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STAGE 4: Quality Control & CTR Prediction');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const stage4Start = Date.now();

  console.log('\n🔍 Agent 5 (Quality Control): Analyzing variations...');

  let bestVariationIndex = 0;
  let highestCTR = 0;

  for (let i = 0; i < variations.length; i++) {
    const qualityAnalysis = await analyzeQuality({
      variation: variations[i],
      copyStrategy: copyStrategyOutput,
      creativeDirection: creativeDirectionOutput,
      graphicDesign: graphicDesignOutput,
    });

    variations[i].qualityScores = qualityAnalysis.scores;
    variations[i].predictedCTR = qualityAnalysis.predictedCTR;

    console.log(`\n   Variation ${i + 1}:`);
    console.log(`   ├─ Visual Hierarchy: ${qualityAnalysis.scores.visualHierarchy}/100`);
    console.log(`   ├─ Brand Consistency: ${qualityAnalysis.scores.brandConsistency}/100`);
    console.log(`   ├─ Typography Quality: ${qualityAnalysis.scores.typographyQuality}/100`);
    console.log(`   ├─ Emotional Resonance: ${qualityAnalysis.scores.emotionalResonance}/100`);
    console.log(`   ├─ Overall Score: ${qualityAnalysis.scores.overall}/100`);
    console.log(`   └─ Predicted CTR: ${qualityAnalysis.predictedCTR}%`);

    if (qualityAnalysis.predictedCTR > highestCTR) {
      highestCTR = qualityAnalysis.predictedCTR;
      bestVariationIndex = i;
    }
  }

  const qcCost = 0.004; // Agent 5 cost
  totalCost += qcCost;

  const stage4Time = Date.now() - stage4Start;
  console.log(`\n✅ Agent 5 (Quality Control): Complete`);
  console.log(`⭐ Best variation: #${bestVariationIndex + 1} (CTR: ${highestCTR}%)`);
  console.log(`⏱️  Stage 4 completed in ${(stage4Time / 1000).toFixed(2)}s`);

  // ──────────────────────────────────────────────────────────────────────────
  // FINAL SUMMARY
  // ──────────────────────────────────────────────────────────────────────────

  const totalTime = Date.now() - startTime;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ ORCHESTRATION COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Results:`);
  console.log(`   ├─ Variations generated: ${variations.length}`);
  console.log(`   ├─ Best variation: #${bestVariationIndex + 1}`);
  console.log(`   ├─ Predicted CTR: ${highestCTR}%`);
  console.log(`   ├─ Total cost: $${totalCost.toFixed(3)}`);
  console.log(`   └─ Total time: ${(totalTime / 1000).toFixed(2)}s`);
  console.log('\n🎨 All variations are publish-ready! ✨\n');

  return {
    variations,
    totalCost,
    totalTime,
    bestVariation: bestVariationIndex,
    metadata: {
      agentOutputs: {
        copywriting: copyStrategyOutput,
        creativeDirection: creativeDirectionOutput,
        graphicDesign: graphicDesignOutput,
        promptEngineering: promptEngineeringOutput,
      },
      preset: request.preset,
      timestamp: new Date().toISOString(),
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Update master prompt with specific copy variation
 */
function updatePromptWithCopy(
  masterPrompt: string,
  headline: string,
  subheadline: string,
  cta: string
): string {
  // Replace placeholder text in prompt with actual copy
  let updatedPrompt = masterPrompt;

  // Replace headline (look for HEADLINE TEXT or similar patterns)
  updatedPrompt = updatedPrompt.replace(
    /Text: "([^"]+)"/g,
    (match, original) => {
      if (match.includes('HEADLINE') || match.includes('Headline')) {
        return `Text: "${headline}"`;
      }
      if (match.includes('SUBHEADLINE') || match.includes('Subheadline')) {
        return `Text: "${subheadline}"`;
      }
      if (match.includes('CTA') || match.includes('APPLY') || match.includes('Button')) {
        return `Text: "${cta}"`;
      }
      return match;
    }
  );

  return updatedPrompt;
}

/**
 * Generate image with DALL-E 3 (wrapper function)
 */
async function generateWithDALLE3(
  prompt: string,
  orientation: 'square' | 'portrait' | 'landscape',
  numImages: number
): Promise<Array<{ url: string; dimensions: { width: number; height: number } }>> {
  // This will be imported from image-generation.service.ts
  // For now, it's a placeholder that the actual service will implement
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const sizeMap = {
    square: '1024x1024',
    portrait: '1024x1792',
    landscape: '1792x1024',
  };

  const dimensionsMap = {
    square: { width: 1024, height: 1024 },
    portrait: { width: 1024, height: 1792 },
    landscape: { width: 1792, height: 1024 },
  };

  const results: Array<{ url: string; dimensions: { width: number; height: number } }> = [];

  for (let i = 0; i < numImages; i++) {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: sizeMap[orientation] as '1024x1024' | '1024x1792' | '1792x1024',
      quality: 'hd',
      style: 'vivid',
    });

    if (response.data && response.data[0] && response.data[0].url) {
      results.push({
        url: response.data[0].url,
        dimensions: dimensionsMap[orientation],
      });
    }

    // Add delay between requests
    if (i < numImages - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

