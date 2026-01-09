/**
 * API Route: V2 Creative Generation
 * 
 * Orchestrates 5 AI agents to generate complete ad creatives
 */

import { NextRequest, NextResponse } from 'next/server';
import { orchestrateCreativeGeneration } from '@/services/orchestrator.service';
import type { Campaign } from '@/types/creative-studio';
import type { PresetName } from '@/services/presets/presets.config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaign, preset, variations, targetAudience } = body as {
      campaign: Campaign;
      preset: PresetName;
      variations: number;
      targetAudience?: string;
    };

    // Validation
    if (!campaign || !campaign.id || !campaign.niche || !campaign.geo) {
      return NextResponse.json(
        { error: 'Campaign with id, niche, and geo is required' },
        { status: 400 }
      );
    }

    if (!preset) {
      return NextResponse.json(
        { error: 'Preset is required' },
        { status: 400 }
      );
    }

    // Call orchestrator
    console.log(`\n🚀 V2 API: Starting generation for campaign "${campaign.name}"`);
    console.log(`   Preset: ${preset}`);
    console.log(`   Variations: ${variations || 2}`);

    const result = await orchestrateCreativeGeneration({
      campaign,
      preset,
      variations: variations || 2,
      targetAudience,
    });

    console.log(`✅ V2 API: Generation complete`);
    console.log(`   Generated: ${result.variations.length} variations`);
    console.log(`   Best: #${result.bestVariation + 1}`);
    console.log(`   Cost: $${result.totalCost.toFixed(3)}`);
    console.log(`   Time: ${(result.totalTime / 1000).toFixed(1)}s\n`);

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('❌ V2 API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate creatives' },
      { status: 500 }
    );
  }
}


