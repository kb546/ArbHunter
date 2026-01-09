/**
 * Batch Orchestrator Service V2
 * Coordinates 5 AI agents to generate 5-20 unique ads
 */

import { detectBrandV2 } from './brand-intelligence.service';
import { generateGeminiImages } from './gemini-image.service';
import { detectCampaignType, type CampaignType } from './campaign-type-detector.service';
import { getDefaultPreset, getPresetConfig, getRecommendedPreset, type CreativePreset } from './creative-presets.service';
import type { GeminiModel } from '@/types/creative-studio';

// Import AI Agents V2
import { generateVariationStrategies, type VariationStrategy } from './agents-v2/variation-strategist.service';
import { generateCopyBatch, type CopyVariation } from './agents-v2/copywriting-batch.service';
import { generateVisualDesigns, type VisualDesign } from './agents-v2/visual-designer-v2.service';
import { generateGeminiPrompts, type GeminiPrompt } from './agents-v2/prompt-engineer.service';
import { assessQuality, convertToQualityScoresV3, type QualityAssessment, type ABTestRecommendation } from './agents-v2/quality-control.service';

export interface BatchGenerationRequest {
  niche: string;
  geo: string;
  targetAudience?: string;
  batchSize: 5 | 10 | 20;
  model?: 'auto' | 'fast' | 'pro';
  marginScore?: number;
  creativePreset?: CreativePreset; // NEW: Creative direction preset
}

export interface BatchVariation {
  id: string;
  imageUrl: string;
  headline: string;
  subheadline: string;
  cta: string;
  visualStyle: string;
  copyTone: string;
  predictedCTR: number;
  visualScore: number;
  brandScore: number;
  textScore: number;
  overallScore: number;
  uniquenessScore: number;
  model: GeminiModel;
  prompt: string;
  generatedAt: string;
  recommendedPair?: string; // ID of recommended A/B test pair
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
}

export interface BatchGenerationResult {
  variations: BatchVariation[];
  totalCost: number;
  totalTime: number;
  metadata: {
    niche: string;
    geo: string;
    brand: {
      name: string;
      detected: boolean;
    };
    batchSize: number;
    modelUsed: string;
    abTestPairs: Array<[string, string]>;
    aiAgentsUsed: boolean;
    costBreakdown: {
      agent1: number;
      agent2: number;
      agent3: number;
      agent4: number;
      agent5: number;
      imageGeneration: number;
      total: number;
    };
  };
}

/**
 * Main batch generation function with AI Agents V2
 * Generates 5-20 UNIQUE ad variations
 */
export async function orchestrateBatchGeneration(
  request: BatchGenerationRequest
): Promise<BatchGenerationResult> {
  const startTime = Date.now();
  const { niche, geo, targetAudience, batchSize, model = 'auto', marginScore, creativePreset } = request;

  console.log(`\n🚀 ============================================`);
  console.log(`🚀 BATCH ORCHESTRATOR V3 - CREATIVE DIRECTOR`);
  console.log(`🚀 ============================================`);
  console.log(`   Niche: ${niche}`);
  console.log(`   GEO: ${geo}`);
  console.log(`   Batch Size: ${batchSize} ads`);
  console.log(`   Model Mode: ${model}`);
  console.log(``);

  let totalAICost = 0;
  const costBreakdown = {
    agent1: 0,
    agent2: 0,
    agent3: 0,
    agent4: 0,
    agent5: 0,
    imageGeneration: 0,
    total: 0,
  };

  // ==========================================================================
  // STEP 1: AUTO-DETECT BRAND (AI-powered)
  // ==========================================================================
  console.log(`📋 STEP 1: Brand Detection (AI-powered)`);
  const detectedBrand = await detectBrandV2(niche, geo);
  const brandName = detectedBrand.name;
  const brandColors = detectedBrand.colors;
  const brandColorNames = detectedBrand.colorNames;
  const brandLogo = detectedBrand?.logo;

  console.log(detectedBrand 
    ? `✅ Brand detected: ${detectedBrand.name}` 
    : `ℹ️  No brand detected, using generic: ${brandName}`
  );

  // Determine campaign type (AI-powered)
  const campaignTypeResult = await detectCampaignType(niche, geo);
  const campaignType = campaignTypeResult.campaignType;
  console.log(`📋 Campaign type: ${campaignType} (${campaignTypeResult.confidence}% confidence)`);
  console.log(`   Reasoning: ${campaignTypeResult.reasoning}`);
  
  // ==========================================================================
  // NEW: SELECT CREATIVE PRESET (Creative Director Layer)
  // ==========================================================================
  const selectedPreset = creativePreset || getRecommendedPreset(campaignType);
  const presetConfig = getPresetConfig(selectedPreset);
  console.log(`\n🎨 CREATIVE DIRECTION`);
  console.log(`   Preset: ${presetConfig.name} (${selectedPreset})`);
  console.log(`   Inspiration: ${presetConfig.inspiration}`);
  console.log(`   Description: ${presetConfig.description}`);
  console.log(``);

  // ==========================================================================
  // STEP 2: AGENT 1 - VARIATION STRATEGIST 🎯
  // ==========================================================================
  console.log(`🎯 STEP 2: Agent 1 - Variation Strategist`);
  const { strategies, cost: agent1Cost } = await generateVariationStrategies({
    niche,
    geo,
    campaignType,
    targetAudience,
    batchSize,
    brandName,
    preset: selectedPreset,
    presetConfig,
  });
  totalAICost += agent1Cost;
  costBreakdown.agent1 = agent1Cost;
  console.log(`✅ ${strategies.length} unique strategies planned`);
  console.log(``);

  // ==========================================================================
  // STEP 3: AGENT 2 - COPYWRITING BATCH ✍️
  // ==========================================================================
  console.log(`✍️  STEP 3: Agent 2 - Copywriting Batch`);
  const { copies, cost: agent2Cost } = await generateCopyBatch({
    niche,
    geo,
    campaignType,
    targetAudience,
    brandName,
    strategies,
    preset: selectedPreset,
    presetConfig,
  });
  totalAICost += agent2Cost;
  costBreakdown.agent2 = agent2Cost;
  console.log(`✅ ${copies.length} unique copy variations written`);
  console.log(``);

  // ==========================================================================
  // STEP 4: AGENT 3 - VISUAL DESIGNER 🎨
  // ==========================================================================
  console.log(`🎨 STEP 4: Agent 3 - Visual Designer`);
  const { designs, cost: agent3Cost } = await generateVisualDesigns({
    niche,
    geo,
    campaignType,
    brandName,
    brandColors,
    brandHeroProduct: detectedBrand?.heroProduct,
    strategies,
    copies,
    preset: selectedPreset,
    presetConfig,
  });
  totalAICost += agent3Cost;
  costBreakdown.agent3 = agent3Cost;
  console.log(`✅ ${designs.length} unique visual designs created`);
  console.log(``);

  // ==========================================================================
  // STEP 5: AGENT 4 - PROMPT ENGINEER 🔧
  // ==========================================================================
  console.log(`🔧 STEP 5: Agent 4 - Prompt Engineer`);
  const { prompts, cost: agent4Cost } = await generateGeminiPrompts({
    niche,
    geo,
    campaignType,
    brandName,
    brandLogo: brandLogo ? {
      description: brandLogo.description,
      position: brandLogo.placement, // Map placement → position
    } : undefined,
    brandColors: {
      primary: brandColors.primary,
      secondary: brandColors.secondary,
      names: brandColorNames,
    },
    strategies,
    copies,
    designs,
    preset: selectedPreset,
    presetConfig,
  });
  totalAICost += agent4Cost;
  costBreakdown.agent4 = agent4Cost;
  console.log(`✅ ${prompts.length} optimized Gemini prompts engineered`);
  console.log(``);

  // ==========================================================================
  // STEP 6: BATCH IMAGE GENERATION 📸
  // ==========================================================================
  console.log(`📸 STEP 6: Batch Image Generation (Gemini)`);
  const selectedModel = selectModelForBatch(model, marginScore, geo);
  console.log(`   Model: ${selectedModel}`);

  const geminiPromptStrings = prompts.map(p => p.prompt);
  const generatedImages = await generateGeminiImages(geminiPromptStrings, selectedModel as GeminiModel);
  
  const imageCost = generatedImages.length * (selectedModel === 'gemini-3-pro-image-preview' ? 0.01 : 0.002);
  totalAICost += imageCost;
  costBreakdown.imageGeneration = imageCost;
  console.log(`✅ ${generatedImages.length} images generated`);
  console.log(``);

  // ==========================================================================
  // STEP 7: BUILD VARIATIONS (Pre-QC)
  // ==========================================================================
  console.log(`🔨 STEP 7: Building variations...`);
  const variations: BatchVariation[] = generatedImages.map((img, idx) => {
    const strategy = strategies[idx];
    const copy = copies[idx];
    const design = designs[idx];
    const prompt = prompts[idx];

    return {
      id: `var-${Date.now()}-${idx}`,
      imageUrl: img.url,
      headline: copy.headline,
      subheadline: copy.subheadline,
      cta: copy.cta,
      visualStyle: strategy.visualStyle,
      copyTone: copy.tone,
      predictedCTR: 0, // Will be filled by Agent 5
      visualScore: 0,
      brandScore: 0,
      textScore: 0,
      overallScore: 0,
      uniquenessScore: calculateUniquenessScore(idx, batchSize),
      model: img.model,
      prompt: prompt.prompt,
      generatedAt: new Date().toISOString(),
    };
  });
  console.log(`✅ ${variations.length} variations built`);
  console.log(``);

  // ==========================================================================
  // STEP 8: AGENT 5 - QUALITY CONTROL ✅
  // ==========================================================================
  console.log(`✅ STEP 8: Agent 5 - Quality Control`);
  const { assessments, abTestPairs, bestVariationId, cost: agent5Cost } = await assessQuality({
    niche,
    geo,
    campaignType,
    strategies,
    copies,
    designs,
    imageUrls: generatedImages.map(img => img.url),
  });
  totalAICost += agent5Cost;
  costBreakdown.agent5 = agent5Cost;
  console.log(`✅ Quality assessment complete`);
  console.log(`🏆 Best variation: ${bestVariationId}`);
  console.log(`🧪 ${abTestPairs.length} A/B test pairs recommended`);
  console.log(``);

  // ==========================================================================
  // STEP 9: APPLY QUALITY SCORES TO VARIATIONS
  // ==========================================================================
  assessments.forEach((assessment, idx) => {
    if (variations[idx]) {
      variations[idx].predictedCTR = assessment.predictedCTR;
      variations[idx].visualScore = Math.round(assessment.visualScore);
      variations[idx].brandScore = Math.round(assessment.brandScore);
      variations[idx].textScore = Math.round(assessment.textScore);
      variations[idx].overallScore = Math.round(assessment.overallScore);
      variations[idx].strengths = assessment.strengths;
      variations[idx].weaknesses = assessment.weaknesses;
      variations[idx].recommendations = assessment.recommendations;
    }
  });

  // Sort by overall score (best first)
  variations.sort((a, b) => b.overallScore - a.overallScore);

  // ==========================================================================
  // STEP 10: ASSIGN A/B TEST PAIRS
  // ==========================================================================
  const abTestPairsIds: Array<[string, string]> = abTestPairs.map(pair => {
    const varA = variations.find(v => v.id.includes(pair.variationA.split('-')[1]));
    const varB = variations.find(v => v.id.includes(pair.variationB.split('-')[1]));
    return [varA?.id || '', varB?.id || ''];
  }).filter(([a, b]) => a && b) as Array<[string, string]>;

  abTestPairsIds.forEach(([idA, idB]) => {
    const varA = variations.find(v => v.id === idA);
    const varB = variations.find(v => v.id === idB);
    if (varA) varA.recommendedPair = idB;
    if (varB) varB.recommendedPair = idA;
  });

  // ==========================================================================
  // FINAL SUMMARY
  // ==========================================================================
  const totalTime = Date.now() - startTime;
  costBreakdown.total = totalAICost;

  console.log(`🎉 ============================================`);
  console.log(`🎉 BATCH GENERATION COMPLETE!`);
  console.log(`🎉 ============================================`);
  console.log(`   Total Variations: ${variations.length}`);
  console.log(`   Best Score: ${variations[0]?.overallScore || 0}/100`);
  console.log(`   Avg Predicted CTR: ${(variations.reduce((sum, v) => sum + v.predictedCTR, 0) / variations.length).toFixed(1)}%`);
  console.log(`   Total Time: ${(totalTime / 1000).toFixed(1)}s`);
  console.log(`   Total Cost: $${totalAICost.toFixed(4)}`);
  console.log(`   Per Ad: $${(totalAICost / batchSize).toFixed(4)}`);
  console.log(`   A/B Pairs: ${abTestPairsIds.length}`);
  console.log(``);
  console.log(`💰 Cost Breakdown:`);
  console.log(`   Agent 1 (Strategist):    $${costBreakdown.agent1.toFixed(4)}`);
  console.log(`   Agent 2 (Copywriter):    $${costBreakdown.agent2.toFixed(4)}`);
  console.log(`   Agent 3 (Designer):      $${costBreakdown.agent3.toFixed(4)}`);
  console.log(`   Agent 4 (Prompt Eng):    $${costBreakdown.agent4.toFixed(4)}`);
  console.log(`   Agent 5 (QC):            $${costBreakdown.agent5.toFixed(4)}`);
  console.log(`   Image Generation:        $${costBreakdown.imageGeneration.toFixed(4)}`);
  console.log(`   ─────────────────────────────────────`);
  console.log(`   TOTAL:                   $${costBreakdown.total.toFixed(4)}`);
  console.log(``);

  return {
    variations,
    totalCost: totalAICost,
    totalTime,
    metadata: {
      niche,
      geo,
      brand: {
        name: brandName,
        detected: !!detectedBrand,
      },
      batchSize,
      modelUsed: selectedModel,
      abTestPairs: abTestPairsIds,
      aiAgentsUsed: true,
      costBreakdown,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
// Campaign type detection now handled by campaign-type-detector.service.ts

function selectModelForBatch(
  model: 'auto' | 'fast' | 'pro',
  marginScore: number | undefined,
  geo: string
): 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview' {
  if (model === 'fast') return 'gemini-2.5-flash-image';
  if (model === 'pro') return 'gemini-3-pro-image-preview';

  // Auto mode: decide based on margin and geo
  if (marginScore !== undefined) {
    if (marginScore >= 8) return 'gemini-3-pro-image-preview';
    if (marginScore >= 6) return 'gemini-3-pro-image-preview';
    return 'gemini-2.5-flash-image';
  }

  // Fallback: check geo tier
  const tier1Countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'SG', 'AE', 'CH', 'NL', 'SE', 'NO'];
  if (tier1Countries.includes(geo)) return 'gemini-3-pro-image-preview';

  return 'gemini-2.5-flash-image';
}

function calculateUniquenessScore(index: number, total: number): number {
  // Higher score for more diverse position in batch
  return Math.round(70 + (index / total) * 30);
}
