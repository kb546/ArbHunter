import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TrendVelocity, CompetitionData, MarginScore } from '@/types';

// Initialize AI clients (will be null if API keys not set)
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

type AIProvider = 'claude' | 'openai' | 'gemini' | 'mock';

interface OpportunityContext {
  geo: string;
  niche: string;
  trendData: TrendVelocity;
  competitionData: CompetitionData;
  preliminaryScore: MarginScore;
}

interface AIAnalysis {
  adjusted_score: number;
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
  risks: string[];
  opportunities: string[];
}

/**
 * Generate the AI prompt for opportunity analysis
 */
function generateAnalysisPrompt(context: OpportunityContext): string {
  return `You are an expert in Facebook-to-AdSense ad arbitrage for 2026. Analyze this opportunity:

GEO: ${context.geo}
Niche: ${context.niche}

TREND DATA:
- Search Volume: ${context.trendData.search_volume.toLocaleString()}
- Growth Rate: ${context.trendData.growth_rate}%
- Peak Interest: ${context.trendData.peak_interest}/100
- Related Keywords: ${context.trendData.related_keywords.join(', ')}

COMPETITION DATA:
- Active Advertisers: ${context.competitionData.advertiser_count}
- Average CPC: $${context.competitionData.avg_cpc}
- Competition Level: ${context.competitionData.competition_level}
- Market Saturation: ${context.competitionData.market_saturation}%

PRELIMINARY MARGIN SCORE: ${context.preliminaryScore.total}/100
- Trend Points: ${context.preliminaryScore.trend_points}
- Competition Points: ${context.preliminaryScore.competition_points}
- Spread Points: ${context.preliminaryScore.spread_points}

YOUR TASK:
1. Validate this opportunity considering:
   - Historical RPM data for this GEO (typical range and seasonality)
   - Niche sustainability (is this a flash trend or sustainable interest?)
   - Ad policy risks (could this niche trigger Meta's Special Ad Category restrictions?)
   - Audience quality (click-through behavior and ad engagement in this GEO)

2. Adjust the score if needed (keep between 1-100)

3. Identify specific risks and opportunities

Respond ONLY with a valid JSON object in this format:
{
  "adjusted_score": <number 1-100>,
  "reasoning": "<your analysis in 2-3 sentences>",
  "confidence": "<high|medium|low>",
  "risks": ["<risk 1>", "<risk 2>"],
  "opportunities": ["<opportunity 1>", "<opportunity 2>"]
}`;
}

/**
 * Parse AI response and extract analysis
 */
function parseAIResponse(response: string): AIAnalysis {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      adjusted_score: parsed.adjusted_score,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
      risks: parsed.risks || [],
      opportunities: parsed.opportunities || [],
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Return a default analysis if parsing fails
    return {
      adjusted_score: 0,
      reasoning: 'Unable to analyze - using algorithmic score only',
      confidence: 'low',
      risks: ['AI analysis unavailable'],
      opportunities: [],
    };
  }
}

/**
 * Generate a mock AI analysis for when Claude API is not available
 */
function generateMockAnalysis(context: OpportunityContext): AIAnalysis {
  const score = context.preliminaryScore.total;
  let reasoning = '';
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  const risks: string[] = [];
  const opportunities: string[] = [];

  // Generate contextual reasoning based on the data
  if (score >= 70) {
    reasoning = `Strong opportunity in ${context.geo}. ${context.niche} shows ${context.trendData.growth_rate > 20 ? 'excellent' : 'solid'} growth with low competition. Good CPC-to-RPM spread.`;
    confidence = 'high';
    opportunities.push('Low advertiser count suggests untapped market');
    opportunities.push('Strong search volume indicates genuine demand');
    if (context.competitionData.avg_cpc < 0.20) {
      opportunities.push('Very low CPC makes scaling affordable');
    }
  } else if (score >= 40) {
    reasoning = `Moderate opportunity in ${context.geo}. ${context.niche} has ${context.competitionData.competition_level} competition. Monitor performance closely before scaling.`;
    confidence = 'medium';
    risks.push('Competition may increase rapidly');
    opportunities.push('Room for optimization with better ad creative');
  } else {
    reasoning = `Limited opportunity in ${context.geo}. ${context.niche} faces challenges with ${context.competitionData.competition_level} competition and ${context.trendData.growth_rate < 0 ? 'declining' : 'slow'} growth.`;
    confidence = 'low';
    risks.push('Low margin potential');
    risks.push('High risk of unprofitable campaigns');
  }

  // Add common risks based on niche
  if (context.niche.toLowerCase().includes('job') || context.niche.toLowerCase().includes('career')) {
    risks.push('Employment ads subject to Special Ad Category restrictions');
  }
  if (context.niche.toLowerCase().includes('loan') || context.niche.toLowerCase().includes('credit')) {
    risks.push('Finance ads require extra compliance measures');
  }

  // Slight adjustment to score based on risk factors
  let adjustedScore = score;
  if (risks.length > 2) {
    adjustedScore = Math.max(1, score - 5);
  }

  return {
    adjusted_score: adjustedScore,
    reasoning,
    confidence,
    risks,
    opportunities,
  };
}

/**
 * Call Claude AI for analysis
 */
async function analyzeWithClaude(context: OpportunityContext): Promise<AIAnalysis> {
  if (!anthropic) throw new Error('Claude not configured');

  console.log('🤖 Analyzing with Claude 3.5 Sonnet');

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: generateAnalysisPrompt(context),
      },
    ],
  });

  const responseText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => ('text' in block ? block.text : ''))
    .join('\n');

  return parseAIResponse(responseText);
}

/**
 * Call OpenAI GPT-4 for analysis
 */
async function analyzeWithOpenAI(context: OpportunityContext): Promise<AIAnalysis> {
  if (!openai) throw new Error('OpenAI not configured');

  console.log('🤖 Analyzing with GPT-4');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in Facebook-to-AdSense ad arbitrage. Respond only with valid JSON.',
      },
      {
        role: 'user',
        content: generateAnalysisPrompt(context),
      },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });

  const responseText = completion.choices[0]?.message?.content || '';
  return parseAIResponse(responseText);
}

/**
 * Call Google Gemini for analysis
 */
async function analyzeWithGemini(context: OpportunityContext): Promise<AIAnalysis> {
  if (!gemini) throw new Error('Gemini not configured');

  console.log('🤖 Analyzing with Google Gemini');

  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  const result = await model.generateContent(generateAnalysisPrompt(context));
  const responseText = result.response.text();
  
  return parseAIResponse(responseText);
}

/**
 * Get available AI provider based on configured API keys
 */
function getAvailableProvider(): AIProvider {
  // Try in order of preference: OpenAI -> Gemini -> Claude -> Mock
  if (openai) return 'openai';
  if (gemini) return 'gemini';
  if (anthropic) return 'claude';
  return 'mock';
}

/**
 * Analyze opportunity with AI (tries multiple providers with fallback)
 * Order: OpenAI -> Gemini -> Claude -> Mock
 */
export async function analyzeOpportunity(
  context: OpportunityContext
): Promise<AIAnalysis> {
  const providers: AIProvider[] = ['openai', 'gemini', 'claude'];
  
  // Try each provider in order
  for (const provider of providers) {
    try {
      let analysis: AIAnalysis;

      switch (provider) {
        case 'openai':
          if (!openai) continue;
          analysis = await analyzeWithOpenAI(context);
          break;
        case 'gemini':
          if (!gemini) continue;
          analysis = await analyzeWithGemini(context);
          break;
        case 'claude':
          if (!anthropic) continue;
          analysis = await analyzeWithClaude(context);
          break;
        default:
          continue;
      }

      // Ensure the adjusted score is valid
      if (
        !analysis.adjusted_score ||
        analysis.adjusted_score < 1 ||
        analysis.adjusted_score > 100
      ) {
        analysis.adjusted_score = context.preliminaryScore.total;
      }

      console.log(`✅ Successfully analyzed with ${provider}`);
      return analysis;
    } catch (error) {
      console.warn(`⚠️  ${provider} failed:`, error instanceof Error ? error.message : 'Unknown error');
      // Continue to next provider
    }
  }

  // All providers failed, use mock analysis
  console.log('🎭 All AI providers unavailable, using mock analysis');
  return generateMockAnalysis(context);
}

/**
 * Batch analyze multiple opportunities
 */
export async function analyzeOpportunities(
  contexts: OpportunityContext[]
): Promise<AIAnalysis[]> {
  // Process in parallel (with rate limiting for real API)
  const analyses = await Promise.all(
    contexts.map((context) => analyzeOpportunity(context))
  );

  return analyses;
}

/**
 * Check if any AI provider is configured and available
 */
export function isClaudeAvailable(): boolean {
  return openai !== null || gemini !== null || anthropic !== null;
}

/**
 * Get the name of the currently active AI provider
 */
export function getActiveProvider(): string {
  const provider = getAvailableProvider();
  const providerNames = {
    openai: 'OpenAI GPT-4',
    gemini: 'Google Gemini',
    claude: 'Claude 3.5 Sonnet',
    mock: 'Mock AI (No API keys configured)',
  };
  return providerNames[provider];
}

