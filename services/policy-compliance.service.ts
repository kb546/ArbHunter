/**
 * Policy Compliance Checker (non-blocking)
 * Lightweight heuristic + optional GPT check to flag likely policy risks for Meta/Google/TikTok.
 *
 * IMPORTANT: This is guidance only, not legal advice.
 */

import OpenAI from 'openai';

export type PolicyRisk = 'low' | 'medium' | 'high';

export type PolicyCheckInput = {
  niche: string;
  geo: string;
  campaignType: string;
  creatives: Array<{
    id: string;
    headline: string;
    subheadline?: string;
    cta?: string;
    prompt?: string;
  }>;
};

export type PolicyCheckResult = {
  overallRisk: PolicyRisk;
  issues: string[];
  perCreative: Array<{ id: string; risk: PolicyRisk; issues: string[] }>;
  provider: 'heuristic' | 'openai';
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

function clampRisk(score: number): PolicyRisk {
  if (score >= 8) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function heuristicCheck(input: PolicyCheckInput): PolicyCheckResult {
  const combined = (s: string) => s.toLowerCase();
  const riskyPatterns: Array<{ re: RegExp; issue: string; weight: number }> = [
    { re: /\bguarantee(d)?\b/i, issue: 'Contains “guarantee” claim (often disallowed unless substantiated).', weight: 3 },
    { re: /\b(get rich|make \$(\d+)|earn \$(\d+)|instant money|easy money)\b/i, issue: 'Potentially misleading earnings claim.', weight: 4 },
    { re: /\bmiracle|cure|cures|heal(s|ing)?|treat(s|ment)?\b/i, issue: 'Possible medical/health claim.', weight: 4 },
    { re: /\blose \d+ ?(lbs|pounds|kg)\b/i, issue: 'Weight loss claim (high scrutiny).', weight: 3 },
    { re: /\bfree\b/i, issue: 'Uses “free” (ensure offer terms are clear and accurate).', weight: 1 },
    { re: /\b(no credit check|guaranteed approval)\b/i, issue: 'Credit/approval claim (high scrutiny).', weight: 4 },
    { re: /\b(you have|your)\b.*\b(disease|condition|debt|income|credit score)\b/i, issue: 'Potentially personalized attribute targeting language.', weight: 3 },
  ];

  const perCreative = input.creatives.map((c) => {
    const text = combined([c.headline, c.subheadline, c.cta, c.prompt].filter(Boolean).join(' '));
    const issues: string[] = [];
    let score = 0;
    for (const r of riskyPatterns) {
      if (r.re.test(text)) {
        issues.push(r.issue);
        score += r.weight;
      }
    }
    return { id: c.id, risk: clampRisk(score), issues };
  });

  const allIssues = Array.from(new Set(perCreative.flatMap((x) => x.issues)));
  const worst = perCreative.reduce<PolicyRisk>((acc, c) => {
    const rank = (r: PolicyRisk) => (r === 'high' ? 3 : r === 'medium' ? 2 : 1);
    return rank(c.risk) > rank(acc) ? c.risk : acc;
  }, 'low');

  return { overallRisk: worst, issues: allIssues, perCreative, provider: 'heuristic' };
}

export async function assessPolicyCompliance(input: PolicyCheckInput): Promise<PolicyCheckResult> {
  // Always run heuristics first (fast, no network)
  const heuristic = heuristicCheck(input);
  if (!openai) return heuristic;

  try {
    const system = `You are a policy compliance assistant for ad creatives on Meta (Facebook/Instagram), Google Ads, and TikTok.
Your job: flag likely policy risk areas and suggest safe rewrites. Be conservative.
Return JSON only.`;

    const user = {
      niche: input.niche,
      geo: input.geo,
      campaignType: input.campaignType,
      creatives: input.creatives.map((c) => ({
        id: c.id,
        headline: c.headline,
        subheadline: c.subheadline,
        cta: c.cta,
      })),
      heuristic: heuristic,
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content:
            `Analyze potential policy risks. Focus on: misleading claims, personal attributes, restricted content, credit/finance promises, health claims, sensationalism.\n\n` +
            `Output JSON with:\n` +
            `{ "overallRisk": "low|medium|high", "issues": string[], "perCreative": [{ "id": string, "risk": "low|medium|high", "issues": string[], "safeRewrite": { "headline"?: string, "subheadline"?: string, "cta"?: string } }] }\n\n` +
            `INPUT:\n` +
            JSON.stringify(user),
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || '{}';
    const parsed = JSON.parse(raw) as any;

    const perCreative = Array.isArray(parsed.perCreative)
      ? parsed.perCreative.map((x: any) => ({
          id: String(x.id || ''),
          risk: (x.risk === 'high' || x.risk === 'medium' ? x.risk : 'low') as PolicyRisk,
          issues: Array.isArray(x.issues) ? x.issues.map((s: any) => String(s)).slice(0, 6) : [],
        }))
      : heuristic.perCreative;

    const issues = Array.isArray(parsed.issues) ? parsed.issues.map((s: any) => String(s)).slice(0, 10) : heuristic.issues;
    const overallRisk = (parsed.overallRisk === 'high' || parsed.overallRisk === 'medium' ? parsed.overallRisk : heuristic.overallRisk) as PolicyRisk;

    return { overallRisk, issues, perCreative, provider: 'openai' };
  } catch {
    return heuristic;
  }
}

