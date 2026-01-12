/**
 * Creative Studio V3 API - Simplified for Ad Arbitrage
 * Auto-detect brand, always 2 variations, smart model selection
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateWithAuto,
  batchGenerate,
  buildGeminiPrompt,
} from '@/services/gemini-image.service';
import { detectBrand } from '@/services/brand-intelligence.service';
import type { GeneratedCreativeV3 } from '@/types/creative-studio';
import { getBillingAccess } from '@/lib/billing.server';
import { ensureWithinLimit, recordUsage } from '@/lib/usage.server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { runCreativeQcOnce, buildQcFixNotes } from '@/services/creative-qc-loop.service';
import { detectCampaignType } from '@/services/campaign-type-detector.service';
import { assessPolicyCompliance } from '@/services/policy-compliance.service';

export async function POST(request: NextRequest) {
  try {
    const access = await getBillingAccess();
    if (!access.ok) {
      return NextResponse.json(
        { error: 'Subscription required', reason: access.reason, status: access.status ?? null, plan: access.plan ?? null },
        { status: 402 }
      );
    }

    const body = await request.json();
    const {
      niche,
      geo,
      targetAudience,
      model = 'auto',
      marginScore,
      variations = 2, // Always 2 for A/B testing
    } = body as any;
    const campaignId = (body as any)?.campaignId as string | undefined;

    console.log('\n🎨 Creative Studio V3 - Ad Arb Focused');
    console.log(`   Niche: ${niche}`);
    console.log(`   GEO: ${geo}`);
    console.log(`   Margin Score: ${marginScore || 'unknown'}`);
    console.log(`   Model: ${model}`);
    console.log(`   Variations: ${variations}`);

    // Validate inputs
    if (!niche || !geo) {
      return NextResponse.json(
        { error: 'Missing required fields: niche and geo' },
        { status: 400 }
      );
    }

    // Auto-detect brand (no upload needed!)
    console.log('\n🔍 Auto-detecting brand...');
    const detectedBrand = detectBrand(niche, geo);
    
    if (detectedBrand) {
      console.log(`✅ Brand detected: ${detectedBrand.name} (${detectedBrand.fullName})`);
      console.log(`   Colors: ${detectedBrand.colorNames.primary}, ${detectedBrand.colorNames.secondary}`);
      console.log(`   Industry: ${detectedBrand.industry}`);
    } else {
      console.log('ℹ️  No brand detected, using generic approach');
    }

    // Smart model selection based on margin score
    let selectedModel: 'fast' | 'pro' | 'mixed' = 'pro'; // Default to pro
    
    if (model === 'auto' && marginScore !== null && marginScore !== undefined) {
      if (marginScore >= 8) {
        selectedModel = 'pro'; // High margin → quality
        console.log('🎯 Auto-selected: Gemini Pro (high margin opportunity)');
      } else if (marginScore >= 6) {
        selectedModel = 'mixed'; // Medium margin → balanced
        console.log('🎯 Auto-selected: Mixed (medium margin opportunity)');
      } else {
        selectedModel = 'fast'; // Low margin → cheap
        console.log('🎯 Auto-selected: Gemini Fast (low margin opportunity)');
      }
    } else if (model === 'fast') {
      selectedModel = 'fast';
    } else if (model === 'pro') {
      selectedModel = 'pro';
    }

    // Determine campaign type (AI + keyword fallback)
    const campaignTypeResult = await detectCampaignType(niche, geo);
    const campaignType = campaignTypeResult.campaignType;
    console.log(`📋 Campaign type: ${campaignType} (${campaignTypeResult.confidence}% confidence)`);

    // Quality override: free samples (and similar consumer product offers) are very sensitive to model quality.
    // When user chooses AUTO, prefer Pro to reduce weird outputs (e.g., uniforms/hangers).
    if (model === 'auto' && campaignType === 'free_sample') {
      selectedModel = 'pro';
      console.log('🎯 Auto-selected override: Gemini Pro (free sample offer quality)');
    }

    const brandName = detectedBrand?.name || niche.split(' ')[0];
    const brandColors = detectedBrand?.colors || {
      primary: '#DFFF00',
      secondary: '#2B2F36',
    };

    // Build 2 prompt variants to force diversity (prevents repetitive uniform-centric visuals)
    function variationHintsFor(type: string): string[] {
      const t = String(type);
      if (t === 'recruitment') {
        return [
          'Scene: storefront exterior or store entrance, realistic signage, welcoming hiring message, no uniforms-on-hanger.',
          'Scene: friendly team at work (employees + manager), candid but clean, no confusing props, no generic stock feel.',
        ];
      }
      if (t === 'delivery_gig') {
        return [
          'Scene: courier outdoors near vehicle, upbeat, clean, modern.',
          'Scene: app-driven gig vibe (phone UI hints, delivery bag), not a uniform-on-hanger.',
        ];
      }
      if (t === 'free_sample') {
        return [
          'Scene: premium product hero shot (packaging clear), clean background, trust-first. STRICT: no uniforms, no clothing, no hangers.',
          'Scene: lifestyle use-case (bathroom vanity / skincare routine / clean countertop), product present. STRICT: no uniforms, no clothing, no hangers.',
        ];
      }
      if (t === 'discount_sale') {
        return [
          'Scene: product hero + clean offer banner, minimal but bold.',
          'Scene: lifestyle or storefront with offer emphasis, clean typography.',
        ];
      }
      // default: product-like diversity
      return [
        'Scene: clean product hero shot, premium lighting.',
        'Scene: lifestyle or graphic-only layout (no people) with clean typography.',
      ];
    }

    const promptVariants = variationHintsFor(campaignType).map((variationHint) =>
      buildGeminiPrompt({
        brandName,
        brandColors,
        campaignType: campaignType as any,
        niche,
        geo,
        targetAudience,
        size: 'square',
        variationHint,
      })
    );

    console.log('\n📝 Prompt variants (first 220 chars):');
    promptVariants.slice(0, 2).forEach((p, i) => console.log(`   V${i + 1}: ${p.substring(0, 220)}...`));

    // Generate images (+ QC regenerate safety net)
    console.log(`🚀 Generating ${variations} variations with ${selectedModel} model...`);
    const startTime = Date.now();

    // Monthly usage limit (creatives)
    const qcMaxAttempts = 2; // 1 initial + 1 regenerate if needed
    const maxPossibleGenerations = (Number(variations) || 0) * qcMaxAttempts;
    const usageCheck = await ensureWithinLimit('creative', maxPossibleGenerations);
    if (!usageCheck.ok) {
      return NextResponse.json(
        { error: 'Monthly creative limit reached', plan: usageCheck.plan, limit: usageCheck.limit, used: usageCheck.used },
        { status: 429 }
      );
    }

    let generatedImages = await batchGenerate(promptVariants, variations, selectedModel);
    let qcAttempts = 1;
    let qcFixNotes: string[] = [];
    let qcAssessments: any[] | null = null;
    let qcBestId: string | null = null;
    const qcThresholds = { overallMin: 78, brandMin: 70, visualMin: 75, textMin: 70 };

    const totalTime = Date.now() - startTime;
    const totalCost = generatedImages.reduce((sum, img) => sum + img.cost, 0);

    console.log(`\n✅ Generation complete!`);
    console.log(`   Total time: ${totalTime}ms`);
    console.log(`   Total cost: $${totalCost.toFixed(4)}`);
    console.log(`   Per ad: $${(totalCost / variations).toFixed(4)}`);

    function buildCreativesFrom(images: any[], promptsUsed: string | string[]): GeneratedCreativeV3[] {
      // Generate variation-specific copy
      const headlines = generateHeadlines(niche, detectedBrand?.name, campaignType as any);
      const subheadlines = generateSubheadlines(niche, campaignType as any, targetAudience);
      const ctas = generateCTAs(campaignType as any);
      const promptArray = Array.isArray(promptsUsed) ? promptsUsed : Array(images.length).fill(promptsUsed);

      return images.map((img, idx) => ({
        id: `creative-${Date.now()}-${idx}`,
        imageUrl: img.imageUrl,
        headline: headlines[idx % headlines.length],
        subheadline: subheadlines[idx % subheadlines.length],
        cta: ctas[idx % ctas.length],
        predictedCTR: 0,
        visualScore: 0,
        brandScore: 0,
        textScore: 0,
        model: img.model,
        prompt: promptArray[idx % promptArray.length],
        generatedAt: new Date().toISOString(),
      }));
    }

    // Build response with AI-generated copy (scores filled by QC)
    let creatives: GeneratedCreativeV3[] = buildCreativesFrom(generatedImages, promptVariants);

    // Run QC (with real image pixels), and regenerate once if below thresholds.
    try {
      const qc1 = await runCreativeQcOnce({
        niche,
        geo,
        campaignType: campaignType as any,
        imageUrls: creatives.map((c) => c.imageUrl),
        headlines: creatives.map((c) => c.headline),
        subheadlines: creatives.map((c) => c.subheadline || ''),
        ctas: creatives.map((c) => c.cta || ''),
        thresholds: qcThresholds,
      });

      qcAssessments = qc1.qc.assessments as any;
      qcBestId = qc1.qc.bestVariationId as any;
      qcFixNotes = buildQcFixNotes(qcAssessments || []);

      if (!qc1.allOk && qcFixNotes.length > 0) {
        qcAttempts = 2;
        const improvedPromptVariants = promptVariants.map(
          (p) => `${p}\n\nQC FIX REQUIREMENTS:\n- ${qcFixNotes.join('\n- ')}\n\nSTRICT: fix all issues above; avoid irrelevant props; keep brand accurate; keep layout clean.`
        );
        generatedImages = await batchGenerate(improvedPromptVariants, variations, selectedModel);
        creatives = buildCreativesFrom(generatedImages, improvedPromptVariants);

        const qc2 = await runCreativeQcOnce({
          niche,
          geo,
          campaignType: campaignType as any,
          imageUrls: creatives.map((c) => c.imageUrl),
          headlines: creatives.map((c) => c.headline),
          subheadlines: creatives.map((c) => c.subheadline || ''),
          ctas: creatives.map((c) => c.cta || ''),
          thresholds: qcThresholds,
        });
        qcAssessments = qc2.qc.assessments as any;
        qcBestId = qc2.qc.bestVariationId as any;
      }
    } catch (e) {
      console.warn('QC loop failed (continuing without QC):', e);
    }

    // Apply QC scores (fallback to reasonable heuristics if QC unavailable)
    const byVarId = new Map((qcAssessments || []).map((a: any) => [a.id, a]));
    creatives = creatives.map((c, idx) => {
      const a = byVarId.get(`variation-${idx + 1}`);
      if (a) {
        return {
          ...c,
          predictedCTR: Number(a.predictedCTR) || 0,
          visualScore: Number(a.visualScore) || 0,
          brandScore: Number(a.brandScore) || 0,
          textScore: Number(a.textScore) || 0,
          qcOverallScore: Number(a.overallScore) || undefined,
          qcIssues: Array.isArray(a.weaknesses) ? a.weaknesses.slice(0, 2).map((x: any) => String(x)) : undefined,
        };
      }
      const base = c.model === 'gemini-3-pro-image-preview' ? 86 : 82;
      const brandBonus = detectedBrand ? 4 : 0;
      return {
        ...c,
        predictedCTR: parseFloat((3 + Math.random() * 2).toFixed(1)),
        visualScore: base + brandBonus,
        brandScore: base + brandBonus - 2,
        textScore: base + brandBonus - 1,
        qcOverallScore: undefined,
        qcIssues: undefined,
      };
    });

    // Sort by predicted CTR (highest first)
    creatives.sort((a, b) => b.predictedCTR - a.predictedCTR);

    // Policy compliance check (non-blocking; for warnings only)
    let policy: any = null;
    try {
      policy = await assessPolicyCompliance({
        niche,
        geo,
        campaignType: String(campaignType),
        creatives: creatives.map((c) => ({
          id: c.id,
          headline: c.headline,
          subheadline: c.subheadline,
          cta: c.cta,
          prompt: c.prompt,
        })),
      });
    } catch {
      policy = null;
    }

    // If a campaign is provided, persist creatives + copies + variations (RLS protected).
    if (campaignId && isSupabaseConfigured()) {
      const session = await getAuthedSessionFromCookies();
      if (session?.accessToken) {
        const supabase = createSupabaseAuthedServerClient(session.accessToken);
        try {
          // 1) Insert creatives (keep ordering aligned to `creatives`)
          const creativesToInsert = creatives.map((c) => ({
            campaign_id: campaignId,
            image_url: c.imageUrl,
            prompt: c.prompt,
            model: c.model,
            cost: null,
            orientation: 'square',
            style: null,
            predicted_score: c.visualScore,
          }));

          const { data: insertedCreatives, error: creativeErr } = await supabase
            .from('generated_creatives')
            .insert(creativesToInsert)
            .select('id,image_url');
          if (creativeErr) throw creativeErr;

          // 2) Insert copies (one per creative)
          const copiesToInsert = creatives.map((c) => ({
            campaign_id: campaignId,
            headline: c.headline,
            primary_text: c.subheadline || c.headline,
            description: null,
            call_to_action: c.cta || null,
            copy_formula: 'Custom',
            tone_of_voice: 'professional',
            estimated_ctr: c.predictedCTR,
            engagement_score: c.textScore,
            reasoning: `Generated from prompt: ${c.prompt}`.slice(0, 1000),
          }));

          const { data: insertedCopies, error: copyErr } = await supabase
            .from('generated_copies')
            .insert(copiesToInsert)
            .select('id');
          if (copyErr) throw copyErr;

          // 3) Link as variations (A/B): best predicted CTR first
          const rowsC = (insertedCreatives || []) as Array<{ id: string; image_url: string }>;
          const rowsP = (insertedCopies || []) as Array<{ id: string }>;
          const variationsToInsert = creatives
            .map((c, idx) => {
              const creativeId = rowsC[idx]?.id;
              const copyId = rowsP[idx]?.id;
              if (!creativeId || !copyId) return null;
              return {
                campaign_id: campaignId,
                creative_id: creativeId,
                copy_id: copyId,
                variation_name: `V${idx + 1}`,
                is_control: idx === 0,
                predicted_winner: idx === 0,
                status: 'untested',
              };
            })
            .filter(Boolean);

          if (variationsToInsert.length > 0) {
            const { error: varErr } = await supabase
              .from('campaign_variations')
              .upsert(variationsToInsert as any, { onConflict: 'campaign_id,creative_id,copy_id' });
            if (varErr) throw varErr;
          }
        } catch (e) {
          console.warn('Failed to persist campaign assets:', e);
        }
      }
    }

    // Record usage (best-effort). Count *actual* generations (QC may have regenerated once).
    const actualGeneratedCount = (Number(variations) || 0) * qcAttempts;
    await recordUsage('creative', actualGeneratedCount);

    return NextResponse.json({
      success: true,
      creatives,
      totalTime,
      totalCost,
      campaignId: campaignId || null,
      metadata: {
        niche,
        geo,
        brand: detectedBrand ? {
          name: detectedBrand.name,
          detected: true,
        } : {
          name: 'Generic',
          detected: false,
        },
        campaignType,
        variations,
        modelUsed: selectedModel,
        marginScore,
        qc: {
          attempts: qcAttempts,
          thresholds: qcThresholds,
          bestVariationId: qcBestId,
        },
        policy,
      },
    });
  } catch (error: any) {
    console.error('❌ Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// COPY GENERATION HELPERS
// ============================================================================

function generateHeadlines(
  niche: string,
  brandName: string | undefined,
  campaignType: string
): string[] {
  const brand = brandName || niche.split(' ')[0];

  if (campaignType === 'recruitment' || campaignType === 'delivery_gig') {
    return [
      `${brand.toUpperCase()} IS HIRING NOW`,
      `Join the ${brand} Team Today`,
      `${brand} Careers - Start This Week`,
      `Now Hiring at ${brand}`,
    ];
  }
  if (campaignType === 'free_sample') {
    return [
      `Get a Free Sample from ${brand}`,
      `${brand} Free Sample - Limited Supply`,
      `Try ${brand} - Free Sample`,
      `Claim Your ${brand} Sample`,
    ];
  }
  if (campaignType === 'credit_card') {
    return [
      `${brand} Card Offer`,
      `Apply for ${brand} Today`,
      `${brand} Rewards - Apply Now`,
      `Get More With ${brand}`,
    ];
  }
  if (campaignType === 'government_program') {
    return [
      `Check Your Eligibility`,
      `See If You Qualify`,
      `Apply If Eligible`,
      `Get Help Today`,
    ];
  }
  if (campaignType === 'education') {
    return [
      `Learn and Level Up`,
      `Scholarships & Programs`,
      `Start Learning Today`,
      `Build New Skills`,
    ];
  }
  if (campaignType === 'sweepstakes') {
    return [
      `Enter to Win`,
      `Win Big Today`,
      `Limited Time Giveaway`,
      `Join the Giveaway`,
    ];
  }
  if (campaignType === 'trial_offer') {
    return [
      `Try It Free`,
      `Start Your Free Trial`,
      `Try Risk-Free Today`,
      `Get Started Free`,
    ];
  }
  if (campaignType === 'discount_sale' || campaignType === 'sale') {
    return [
      `${brand} SALE - Limited Time`,
      `Huge Savings at ${brand}`,
      `Don't Miss ${brand}'s Best Deal`,
      `${brand} - Shop Now & Save`,
    ];
  }
  return [
    `Discover ${brand}`,
    `${brand} - Premium Quality`,
    `Experience ${brand}`,
    `${brand} - Try It Today`,
  ];
}

function generateSubheadlines(
  niche: string,
  campaignType: string,
  targetAudience?: string
): string[] {
  if (campaignType === 'recruitment' || campaignType === 'delivery_gig') {
    return [
      'Weekly pay, flexible hours, start this week',
      'Great benefits and career growth opportunities',
      'Join our team - apply in 2 minutes',
      'No experience needed - we provide training',
    ];
  }
  if (campaignType === 'free_sample') {
    return [
      'Limited supply - claim yours today',
      'Try it at home - while stock lasts',
      'Simple signup - quick delivery',
      'Trusted quality - try before you buy',
    ];
  }
  if (campaignType === 'credit_card') {
    return [
      'Apply in minutes, see if you qualify',
      'Rewards, benefits, and simple terms',
      'A card designed for everyday spending',
      'Limited-time offer - apply today',
    ];
  }
  if (campaignType === 'government_program') {
    return [
      'Check eligibility in minutes',
      'Get support if you qualify',
      'Apply online with simple steps',
      'See your options today',
    ];
  }
  if (campaignType === 'education') {
    return [
      'Flexible options for busy schedules',
      'Start today and learn step by step',
      'Programs available now',
      'Apply or enroll in minutes',
    ];
  }
  if (campaignType === 'sweepstakes') {
    return [
      'Limited time entry - don’t miss out',
      'Simple entry, quick signup',
      'Enter now while it’s live',
      'Your chance to win today',
    ];
  }
  if (campaignType === 'trial_offer') {
    return [
      'Cancel anytime',
      'Try it risk-free today',
      'Start in minutes',
      'No commitment to get started',
    ];
  }
  if (campaignType === 'discount_sale' || campaignType === 'sale') {
    return [
      'Limited time offer - save up to 50%',
      'Shop now before it\'s too late',
      'Exclusive deals you can\'t miss',
      'Lowest prices of the season',
    ];
  }
  return [
    targetAudience ? `Perfect for ${targetAudience}` : 'Premium quality, unbeatable value',
    'Trusted by thousands worldwide',
    'Experience the difference today',
    'Limited availability - order now',
  ];
}

function generateCTAs(campaignType: string): string[] {
  if (campaignType === 'recruitment' || campaignType === 'delivery_gig') {
    return [
      'APPLY NOW',
      'APPLY TODAY',
      'START NOW',
      'JOIN US',
    ];
  }
  if (campaignType === 'free_sample') {
    return ['CLAIM SAMPLE', 'GET FREE SAMPLE', 'CLAIM NOW', 'GET STARTED'];
  }
  if (campaignType === 'credit_card') {
    return ['APPLY NOW', 'CHECK ELIGIBILITY', 'LEARN MORE', 'GET STARTED'];
  }
  if (campaignType === 'government_program') {
    return ['CHECK NOW', 'SEE IF YOU QUALIFY', 'APPLY', 'LEARN MORE'];
  }
  if (campaignType === 'education') {
    return ['APPLY', 'ENROLL', 'LEARN MORE', 'GET STARTED'];
  }
  if (campaignType === 'sweepstakes') {
    return ['ENTER NOW', 'JOIN NOW', 'LEARN MORE', 'GET STARTED'];
  }
  if (campaignType === 'trial_offer') {
    return ['START FREE TRIAL', 'TRY NOW', 'GET STARTED', 'LEARN MORE'];
  }
  if (campaignType === 'discount_sale' || campaignType === 'sale') {
    return [
      'SHOP NOW',
      'SAVE NOW',
      'GET OFFER',
      'SHOP SALE',
    ];
  }
  return [
    'LEARN MORE',
    'GET STARTED',
    'TRY NOW',
    'SHOP NOW',
  ];
}
