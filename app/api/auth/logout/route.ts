import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth.server';

export async function POST() {
  await clearAuthCookies();
  // Redirect user to login page after logout
  return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), {
    status: 303,
  });
}

