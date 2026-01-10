import { assessQuality } from '@/services/agents-v2/quality-control.service';
import type { CampaignType as AgentCampaignType, VariationStrategy } from '@/services/agents-v2/variation-strategist.service';
import type { CopyVariation } from '@/services/agents-v2/copywriting-batch.service';
import type { VisualDesign } from '@/services/agents-v2/visual-designer-v2.service';

export type QCThresholds = {
  overallMin: number;
  brandMin: number;
  visualMin: number;
  textMin: number;
};

export type QCLoopResult = {
  ok: boolean;
  attempts: number;
  assessments: any[];
  bestVariationId: string | null;
  fixNotes: string[];
};

/**
 * Minimal “generate → assess → optional regenerate” loop.
 * We use real image inputs (data URLs) so QC can actually evaluate the pixels.
 */
export async function runCreativeQcOnce(params: {
  niche: string;
  geo: string;
  campaignType: AgentCampaignType;
  imageUrls: string[];
  headlines: string[];
  subheadlines: string[];
  ctas: string[];
  thresholds: QCThresholds;
}) {
  const { niche, geo, campaignType, imageUrls, headlines, subheadlines, ctas, thresholds } = params;

  const strategies: VariationStrategy[] = imageUrls.map((_, idx) => ({
    id: `variation-${idx + 1}`,
    visualStyle: idx === 0 ? 'premium' : 'bold',
    visualCategory: campaignType === 'recruitment' ? 'people' : 'product',
    headlineApproach: idx === 0 ? 'benefit' : 'curiosity',
    ctaType: idx === 0 ? 'direct' : 'urgent',
    colorScheme: 'brand',
    layout: idx === 0 ? 'hero' : 'split',
    mood: 'professional',
    reasoning: 'Auto-generated QC scaffold for V3.',
  }));

  const copies: CopyVariation[] = imageUrls.map((_, idx) => ({
    id: `copy-${idx + 1}`,
    headline: headlines[idx] || headlines[0] || 'Headline',
    subheadline: subheadlines[idx] || subheadlines[0] || 'Subheadline',
    cta: ctas[idx] || ctas[0] || 'Learn More',
    approach: 'direct',
    tone: 'professional',
    keyBenefit: 'Clarity + relevance',
    reasoning: 'Auto-generated QC scaffold for V3.',
  })) as any;

  const designs: VisualDesign[] = imageUrls.map((_, idx) => ({
    id: `design-${idx + 1}`,
    visualCategory: campaignType === 'recruitment' ? 'people' : 'product',
    mainElement: { type: 'product', description: 'Hero element for ad', styleNotes: [] },
    background: { type: 'clean', description: 'Clean brand-aligned background', styleNotes: [] },
    logoPlacement: { position: 'top-left', description: 'Brand presence', size: 'medium', opacity: 1 },
    textLayout: { style: 'stacked', description: 'Mobile-first type hierarchy', hierarchy: [] },
    composition: { rule: 'rule-of-thirds', focalPoint: 'Hero element', balance: 'balanced' },
    lighting: { type: 'studio', description: 'High quality lighting', direction: 'front' },
    mood: 'professional',
    colorPalette: { primary: '#000000', secondary: '#666666', accent: '#ffffff' },
    typography: { headlineFont: 'Sans', bodyFont: 'Sans', treatment: 'clean' },
    negativePrompts: [],
  })) as any;

  const qc = await assessQuality({
    niche,
    geo,
    campaignType: campaignType as any,
    strategies,
    copies,
    designs,
    imageUrls,
  });

  const byId = new Map((qc.assessments || []).map((a: any) => [a.id, a]));
  const allOk = strategies.every((s) => {
    const a = byId.get(s.id);
    if (!a) return false;
    return (
      a.overallScore >= thresholds.overallMin &&
      a.brandScore >= thresholds.brandMin &&
      a.visualScore >= thresholds.visualMin &&
      a.textScore >= thresholds.textMin
    );
  });

  return { qc, allOk };
}

export function buildQcFixNotes(assessments: any[]): string[] {
  const notes: string[] = [];
  for (const a of assessments || []) {
    for (const w of a.weaknesses || []) notes.push(String(w));
    for (const r of a.recommendations || []) notes.push(String(r));
  }
  // Dedupe + cap to keep prompt small
  return Array.from(new Set(notes.map((s) => s.trim()).filter(Boolean))).slice(0, 10);
}

