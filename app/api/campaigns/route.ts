/**
 * Campaigns API - CRUD Operations
 * Handles campaign creation, retrieval, update, and deletion
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import type { Campaign, CreateCampaignRequest } from '@/types/creative-studio';

// ============================================================================
// GET - Fetch all campaigns for a user
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const session = await getAuthedSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAuthedServerClient(session.accessToken);
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching campaigns:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaigns: data || [] });

  } catch (error) {
    console.error('❌ Campaigns GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create a new campaign
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: CreateCampaignRequest = await request.json();
    const { name, niche, geo, target_audience, discovery_id } = body;

    // Validation
    if (!name || !niche || !geo) {
      return NextResponse.json(
        { error: 'name, niche, and geo are required' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const session = await getAuthedSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newCampaign: Partial<Campaign> = {
      user_id: session.user.id,
      name,
      niche,
      geo,
      target_audience: target_audience || null,
      discovery_id: discovery_id || null,
      status: 'draft',
    };

    const supabase = createSupabaseAuthedServerClient(session.accessToken);
    const { data, error } = await supabase
      .from('campaigns')
      .insert(newCampaign)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating campaign:', error);
      
      // Check if table doesn't exist
      if (error.message?.includes('relation "campaigns" does not exist')) {
        return NextResponse.json(
          { 
            error: 'Database not set up. Please run the migration: supabase/migrations/002_creative_studio.sql',
            details: 'The campaigns table does not exist. See RUN_THIS_FIRST.md'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create campaign',
          details: error.message || 'Unknown error'
        },
        { status: 500 }
      );
    }

    console.log('✅ Campaign created:', data.id);

    return NextResponse.json({
      success: true,
      campaign: data,
      message: 'Campaign created successfully',
    });

  } catch (error) {
    console.error('❌ Campaigns POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update a campaign
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    const session = await getAuthedSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAuthedServerClient(session.accessToken);
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', campaignId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating campaign:', error);
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      );
    }

    console.log('✅ Campaign updated:', campaignId);

    return NextResponse.json({
      success: true,
      campaign: data,
      message: 'Campaign updated successfully',
    });

  } catch (error) {
    console.error('❌ Campaigns PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Delete a campaign
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    const session = await getAuthedSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAuthedServerClient(session.accessToken);
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) {
      console.error('❌ Error deleting campaign:', error);
      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      );
    }

    console.log('✅ Campaign deleted:', campaignId);

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });

  } catch (error) {
    console.error('❌ Campaigns DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

