import { NextResponse } from 'next/server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { getCurrentPlanKey, getMonthlyUsage, PLAN_LIMITS } from '@/lib/usage.server';

export async function GET() {
  try {
    const session = await getAuthedSessionFromCookies();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const plan = await getCurrentPlanKey();
    const usage = await getMonthlyUsage();
    const limits = PLAN_LIMITS[plan];

    return NextResponse.json({
      plan,
      usage,
      limits,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load usage' }, { status: 500 });
  }
}

