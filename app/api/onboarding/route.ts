import { NextRequest, NextResponse } from 'next/server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';

export type OnboardingChecklistKey =
  | 'run_discovery'
  | 'generate_creatives'
  | 'save_campaign'
  | 'export_copy'
  | 'open_campaigns';

export type OnboardingState = {
  dismissed: boolean;
  checklist: Partial<Record<OnboardingChecklistKey, { done: boolean; doneAt?: string }>>;
  tour: {
    active?: boolean;
    completed?: boolean;
    currentStepId?: string | null;
    completedAt?: string;
  };
};

function defaultState(): OnboardingState {
  return {
    dismissed: false,
    checklist: {
      run_discovery: { done: false },
      generate_creatives: { done: false },
      save_campaign: { done: false },
      export_copy: { done: false },
      open_campaigns: { done: false },
    },
    tour: {
      active: false,
      completed: false,
      currentStepId: null,
    },
  };
}

function mergeState(base: OnboardingState, patch: Partial<OnboardingState>): OnboardingState {
  return {
    dismissed: typeof patch.dismissed === 'boolean' ? patch.dismissed : base.dismissed,
    checklist: { ...(base.checklist || {}), ...(patch.checklist || {}) },
    tour: { ...(base.tour || {}), ...(patch.tour || {}) },
  };
}

async function getOrCreate(supabase: ReturnType<typeof createSupabaseAuthedServerClient>, userId: string) {
  const { data, error } = await supabase.from('user_onboarding').select('*').eq('user_id', userId).maybeSingle();
  if (data) {
    const state: OnboardingState = {
      dismissed: Boolean((data as any).dismissed),
      checklist: ((data as any).checklist || {}) as any,
      tour: ((data as any).tour || {}) as any,
    };
    return state;
  }

  // Create row (RLS allows user to insert their own)
  const initial = defaultState();
  await supabase.from('user_onboarding').insert({
    user_id: userId,
    dismissed: initial.dismissed,
    checklist: initial.checklist,
    tour: initial.tour,
  });

  // Best-effort activation analytics: treat first onboarding row creation as "signup completed / first app open".
  try {
    await supabase.from('activation_events').insert({
      user_id: userId,
      event_name: 'signup_completed',
      meta: { source: 'onboarding_init' },
    } as any);
  } catch {
    // ignore if table not created yet
  }
  return initial;
}

export async function GET() {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user || !session.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseAuthedServerClient(session.accessToken);
  const state = await getOrCreate(supabase, session.user.id);
  return NextResponse.json({ state });
}

export async function POST(req: NextRequest) {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user || !session.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseAuthedServerClient(session.accessToken);
  const patch = (await req.json().catch(() => ({}))) as Partial<OnboardingState>;

  const current = await getOrCreate(supabase, session.user.id);
  const next = mergeState(current, patch);

  const { error } = await supabase
    .from('user_onboarding')
    .update({
      dismissed: next.dismissed,
      checklist: next.checklist,
      tour: next.tour,
    })
    .eq('user_id', session.user.id);

  if (error) return NextResponse.json({ error: error.message || 'Failed to update onboarding state' }, { status: 500 });
  return NextResponse.json({ state: next });
}

