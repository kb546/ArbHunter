/**
 * Batch Creative Generation API
 * Generates 5-20 unique ad variations in parallel
 */

import { NextRequest, NextResponse } from 'next/server';
import { orchestrateBatchGeneration } from '@/services/batch-orchestrator.service';
import type { BatchGenerationRequest } from '@/services/batch-orchestrator.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      niche,
      geo,
      targetAudience,
      batchSize = 5,
      model = 'auto',
      marginScore,
    }: BatchGenerationRequest = body;

    console.log('\n🎨 Batch Creative Generation API');
    console.log(`   Niche: ${niche}`);
    console.log(`   GEO: ${geo}`);
    console.log(`   Batch Size: ${batchSize}`);
    console.log(`   Model: ${model}`);

    // Validate inputs
    if (!niche || !geo) {
      return NextResponse.json(
        { error: 'Missing required fields: niche and geo' },
        { status: 400 }
      );
    }

    if (![5, 10, 20].includes(batchSize)) {
      return NextResponse.json(
        { error: 'Batch size must be 5, 10, or 20' },
        { status: 400 }
      );
    }

    // Orchestrate batch generation
    const result = await orchestrateBatchGeneration({
      niche,
      geo,
      targetAudience,
      batchSize,
      model,
      marginScore,
    });

    return NextResponse.json({
      success: true,
      variations: result.variations,
      totalCost: result.totalCost,
      totalTime: result.totalTime,
      metadata: result.metadata,
    });
  } catch (error: any) {
    console.error('❌ Batch generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


