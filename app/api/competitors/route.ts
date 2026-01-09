import { NextRequest, NextResponse } from 'next/server';
import { analyzeRealCompetitors } from '@/services/competitors-real.service';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { geo, niche } = body;

    if (!geo || !niche) {
      return NextResponse.json(
        { success: false, error: 'Missing geo or niche' },
        { status: 400 }
      );
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 COMPETITOR ANALYSIS REQUEST`);
    console.log(`   Niche: "${niche}"`);
    console.log(`   GEO: ${geo}`);
    console.log(`   Time: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    // Get REAL competitor analysis using Apify + Playwright
    const analysis = await analyzeRealCompetitors(geo, niche);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ COMPETITOR ANALYSIS COMPLETE`);
    console.log(`   Advertisers: ${analysis.total_advertisers}`);
    console.log(`   Source: ${analysis.data_source}`);
    console.log(`   Duration: ${duration}s`);
    console.log(`${'='.repeat(60)}\n`);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`\n${'='.repeat(60)}`);
    console.error(`❌ COMPETITOR ANALYSIS FAILED (${duration}s)`);
    console.error('Error:', error);
    console.error(`${'='.repeat(60)}\n`);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

