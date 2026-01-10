import { NextRequest, NextResponse } from 'next/server';
import { getTrendData } from '@/services/trends.service';
import { getCompetitionData } from '@/services/meta.service';
import { analyzeOpportunity } from '@/services/claude.service';
import { calculateMarginScore } from '@/lib/scoring';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { Discovery, DiscoverRequest } from '@/types';
import { ensureWithinLimit, recordUsage } from '@/lib/usage.server';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: DiscoverRequest = await request.json();
    const { geo, niche } = body;

    // Validate input
    if (!geo || !niche) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: geo and niche',
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Running discovery for ${niche} in ${geo}`);

    // Step 1: Fetch trend data
    const trendData = await getTrendData(geo, niche);
    console.log(`📊 Trend data: ${trendData.search_volume} volume, ${trendData.growth_rate}% growth`);

    // Step 2: Fetch competition data
    const competitionData = await getCompetitionData(geo, niche);
    console.log(
      `🎯 Competition: ${competitionData.advertiser_count} advertisers, $${competitionData.avg_cpc} CPC`
    );

    // Step 3: Calculate preliminary margin score
    const preliminaryScore = calculateMarginScore(geo, trendData, competitionData);
    console.log(`📈 Preliminary score: ${preliminaryScore.total}/100`);

    // Step 4: AI analysis and score adjustment
    const aiAnalysis = await analyzeOpportunity({
      geo,
      niche,
      trendData,
      competitionData,
      preliminaryScore,
    });

    console.log(`🤖 AI adjusted score: ${aiAnalysis.adjusted_score}/100`);

    // Use AI-adjusted score as final score
    const finalScore = aiAnalysis.adjusted_score;

    // Step 5: Create discovery record
    const discovery: Discovery = {
      id: crypto.randomUUID(),
      geo,
      niche,
      margin_score: finalScore,
      trend_velocity: trendData,
      competition_data: competitionData,
      ai_reasoning: aiAnalysis.reasoning,
      created_at: new Date().toISOString(),
    };

    // Step 6: Save to database (auth required for production)
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 503 }
      );
    }

    const session = await getAuthedSessionFromCookies();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Usage limits (monthly): count discoveries
    const limitCheck = await ensureWithinLimit('discovery', 1);
    if (!limitCheck.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Monthly discovery limit reached',
          limit: limitCheck.limit,
          used: limitCheck.used,
          plan: limitCheck.plan,
        },
        { status: 429 }
      );
    }

    const supabase = createSupabaseAuthedServerClient(session.accessToken);
    const { data: saved, error } = await supabase
      .from('discoveries')
      .insert({
        user_id: session.user.id,
        geo: discovery.geo,
        niche: discovery.niche,
        margin_score: discovery.margin_score,
        trend_velocity: discovery.trend_velocity,
        competition_data: discovery.competition_data,
        ai_reasoning: discovery.ai_reasoning,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error saving to Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to save discovery' },
        { status: 500 }
      );
    }

    console.log('✅ Saved to Supabase:', saved?.id);

    // Record usage event (best-effort)
    await recordUsage('discovery', 1);

    // Return success response
    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error('Error in discover endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

