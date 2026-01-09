/**
 * AGENT 5: QUALITY CONTROL
 * 
 * Role: Quality Analyst + CTR Prediction Specialist
 * Model: GPT-4o (or algorithmic scoring)
 * Expertise: Ad quality assessment, CTR prediction, A/B test recommendations
 * 
 * Analyzes generated creatives and predicts performance
 */

import type {
  GeneratedVariation,
  CopyStrategyOutput,
  CreativeDirectionOutput,
  GraphicDesignOutput,
} from '../orchestrator.service';

// ============================================================================
// TYPES
// ============================================================================

export interface QualityAnalysisRequest {
  variation: GeneratedVariation;
  copyStrategy: CopyStrategyOutput;
  creativeDirection: CreativeDirectionOutput;
  graphicDesign: GraphicDesignOutput;
}

export interface QualityAnalysisOutput {
  scores: {
    visualHierarchy: number;
    brandConsistency: number;
    typographyQuality: number;
    emotionalResonance: number;
    overall: number;
  };
  predictedCTR: number;
  strengths: string[];
  improvements: string[];
  recommendation: 'publish' | 'test' | 'regenerate';
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Analyze creative quality and predict CTR
 * Uses algorithmic scoring (fast, no API costs)
 */
export async function analyzeQuality(
  request: QualityAnalysisRequest
): Promise<QualityAnalysisOutput> {
  const { variation, copyStrategy, creativeDirection, graphicDesign } = request;

  // Score each dimension (0-100)
  const visualHierarchy = scoreVisualHierarchy(variation, creativeDirection);
  const brandConsistency = scoreBrandConsistency(variation, creativeDirection);
  const typographyQuality = scoreTypographyQuality(variation, graphicDesign);
  const emotionalResonance = scoreEmotionalResonance(variation, copyStrategy);

  // Calculate overall score (weighted average)
  const overall = Math.round(
    visualHierarchy * 0.30 +
    brandConsistency * 0.25 +
    typographyQuality * 0.25 +
    emotionalResonance * 0.20
  );

  // Predict CTR based on scores and copy quality
  const predictedCTR = predictCTR(overall, copyStrategy);

  // Generate insights
  const strengths = identifyStrengths(overall, visualHierarchy, brandConsistency, typographyQuality, emotionalResonance);
  const improvements = identifyImprovements(overall, visualHierarchy, brandConsistency, typographyQuality, emotionalResonance);

  // Make recommendation
  const recommendation = makeRecommendation(overall, predictedCTR);

  return {
    scores: {
      visualHierarchy,
      brandConsistency,
      typographyQuality,
      emotionalResonance,
      overall,
    },
    predictedCTR,
    strengths,
    improvements,
    recommendation,
  };
}

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Score visual hierarchy (0-100)
 * Assesses if the layout guides the eye effectively
 */
function scoreVisualHierarchy(
  variation: GeneratedVariation,
  creativeDirection: CreativeDirectionOutput
): number {
  let score = 70; // Base score

  // Check if copy follows hierarchy
  const { headline, subheadline, cta } = variation.copyStrategy;

  // Headline should be bold and prominent
  if (headline.length >= 5 && headline.length <= 50) score += 5;
  if (headline.toUpperCase() === headline) score += 3; // All caps (attention-grabbing)
  if (headline.includes('NOW') || headline.includes('TODAY')) score += 2; // Urgency

  // Subheadline should stack benefits
  if (subheadline.includes('•')) score += 3; // Has bullet separators
  if (subheadline.split('•').length >= 2) score += 2; // Multiple benefits

  // CTA should be action-oriented
  if (cta.includes('APPLY') || cta.includes('START') || cta.includes('JOIN')) score += 3;
  if (cta.length <= 20) score += 2; // Concise

  // Visual hierarchy from creative direction
  if (creativeDirection.visualHierarchy.length >= 3) score += 5;

  return Math.min(score, 100);
}

/**
 * Score brand consistency (0-100)
 * Assesses if the creative aligns with brand guidelines
 */
function scoreBrandConsistency(
  variation: GeneratedVariation,
  creativeDirection: CreativeDirectionOutput
): number {
  let score = 75; // Base score (assume good by default)

  // Check if brand guidelines exist
  if (creativeDirection.brandGuidelines) {
    score += 10; // Has brand guidelines

    // Check if brand name is in headline
    const brandName = creativeDirection.brandGuidelines.brandName;
    if (variation.copyStrategy.headline.includes(brandName.toUpperCase())) {
      score += 5; // Brand in headline
    }

    // Check if colors are used
    if (creativeDirection.colorStrategy.primary) {
      score += 5; // Has official colors
    }
  }

  // Check color strategy reasoning
  if (creativeDirection.colorStrategy.reasoning.length > 50) {
    score += 5; // Thoughtful color strategy
  }

  return Math.min(score, 100);
}

/**
 * Score typography quality (0-100)
 * Assesses if text will be readable and professional
 */
function scoreTypographyQuality(
  variation: GeneratedVariation,
  graphicDesign: GraphicDesignOutput
): number {
  let score = 75; // Base score

  // Check headline specs
  const headline = graphicDesign.typography.headline;
  if (headline.fontSize.includes('72') || headline.fontSize.includes('84')) {
    score += 5; // Good size
  }
  if (headline.fontStyle.includes('Bold')) score += 3;
  if (headline.effects && headline.effects.includes('outline')) score += 2; // Contrast

  // Check CTA specs
  const cta = graphicDesign.typography.cta;
  if (cta.background && cta.background.includes('#')) score += 3; // Has background
  if (cta.borderRadius && cta.borderRadius.includes('60')) score += 2; // Pill shape
  if (cta.shadow) score += 2; // Has depth

  // Check spacing
  if (graphicDesign.spacing.headlineToProduct) score += 3;
  if (graphicDesign.spacing.subheadlineToCTA) score += 3;

  // Readability - check copy length
  if (variation.copyStrategy.headline.length <= 60) score += 2; // Not too long

  return Math.min(score, 100);
}

/**
 * Score emotional resonance (0-100)
 * Assesses if the creative triggers the target emotion
 */
function scoreEmotionalResonance(
  variation: GeneratedVariation,
  copyStrategy: CopyStrategyOutput
): number {
  let score = 70; // Base score

  // Check copy tone alignment
  const { headline, subheadline, cta } = variation.copyStrategy;

  // Urgency indicators
  if (headline.includes('NOW') || headline.includes('TODAY') || headline.includes('LIMITED')) {
    score += 5;
  }

  // Benefit stacking
  const benefitCount = subheadline.split('•').length;
  if (benefitCount >= 2) score += 3;
  if (benefitCount >= 3) score += 2;

  // Action-oriented CTA
  if (cta.includes('APPLY') || cta.includes('START') || cta.includes('JOIN') || cta.includes('GET')) {
    score += 5;
  }

  // Check for friction reducers
  if (headline.includes('2 MINUTES') || headline.includes('EASY') || headline.includes('SIMPLE')) {
    score += 3;
  }
  if (subheadline.includes('No Experience') || subheadline.includes('Free') || subheadline.includes('Flexible')) {
    score += 4;
  }

  // Predicted CTR from copywriting
  if (copyStrategy.predictedCTR >= 8.0) score += 5;
  if (copyStrategy.predictedCTR >= 10.0) score += 3;

  return Math.min(score, 100);
}

// ============================================================================
// CTR PREDICTION
// ============================================================================

/**
 * Predict CTR based on quality scores and copy
 */
function predictCTR(
  overallScore: number,
  copyStrategy: CopyStrategyOutput
): number {
  // Base CTR from overall quality score
  let ctr = 2.0; // Industry baseline

  // Score multipliers
  if (overallScore >= 90) ctr = 10.0;
  else if (overallScore >= 85) ctr = 9.0;
  else if (overallScore >= 80) ctr = 8.0;
  else if (overallScore >= 75) ctr = 7.0;
  else if (overallScore >= 70) ctr = 6.0;
  else if (overallScore >= 65) ctr = 5.0;
  else if (overallScore >= 60) ctr = 4.0;
  else ctr = 3.0;

  // Adjust based on copywriting prediction
  const copyPrediction = copyStrategy.predictedCTR || 7.5;
  ctr = (ctr + copyPrediction) / 2; // Average of both predictions

  // Add randomness (±0.5%)
  ctr += (Math.random() - 0.5);

  return Math.max(2.0, Math.min(15.0, Number(ctr.toFixed(1))));
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

/**
 * Identify strengths
 */
function identifyStrengths(
  overall: number,
  visualHierarchy: number,
  brandConsistency: number,
  typographyQuality: number,
  emotionalResonance: number
): string[] {
  const strengths: string[] = [];

  if (overall >= 90) strengths.push('Exceptional overall quality - publish immediately');
  if (visualHierarchy >= 90) strengths.push('Perfect visual hierarchy - eye naturally flows through ad');
  if (brandConsistency >= 95) strengths.push('Flawless brand consistency - corporate-approved');
  if (typographyQuality >= 90) strengths.push('Professional typography - highly readable');
  if (emotionalResonance >= 85) strengths.push('Strong emotional trigger - will drive action');

  if (strengths.length === 0) {
    strengths.push('Solid foundation - good for A/B testing');
  }

  return strengths;
}

/**
 * Identify potential improvements
 */
function identifyImprovements(
  overall: number,
  visualHierarchy: number,
  brandConsistency: number,
  typographyQuality: number,
  emotionalResonance: number
): string[] {
  const improvements: string[] = [];

  if (visualHierarchy < 80) improvements.push('Consider stronger headline to draw attention first');
  if (brandConsistency < 85) improvements.push('Ensure official brand colors and logo are prominent');
  if (typographyQuality < 85) improvements.push('Increase font sizes for better mobile readability');
  if (emotionalResonance < 80) improvements.push('Add more urgency or benefit stacking to copy');

  if (overall < 75) improvements.push('Consider regenerating with different preset or copy variations');

  if (improvements.length === 0) {
    improvements.push('No major improvements needed - ready to publish');
  }

  return improvements;
}

/**
 * Make recommendation
 */
function makeRecommendation(
  overall: number,
  predictedCTR: number
): 'publish' | 'test' | 'regenerate' {
  if (overall >= 90 && predictedCTR >= 9.0) return 'publish';
  if (overall >= 75 && predictedCTR >= 7.0) return 'test';
  return 'regenerate';
}


