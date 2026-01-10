import { NextResponse, type NextRequest } from 'next/server';

const AUTH_COOKIE = 'sb-access-token';

function isProtectedPath(pathname: string) {
  if (pathname.startsWith('/creative-studio')) return true;
  if (pathname.startsWith('/account')) return true;
  // Protect cost-incurring and user-data endpoints
  if (pathname.startsWith('/api/v3/')) return true;
  if (pathname.startsWith('/api/discover')) return true;
  if (pathname.startsWith('/api/discoveries')) return true;
  if (pathname.startsWith('/api/campaigns')) return true;
  if (pathname.startsWith('/api/usage')) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const accessToken = req.cookies.get(AUTH_COOKIE)?.value;
  if (accessToken) return NextResponse.next();

  // API requests should return 401 JSON; pages should redirect to login.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = '/auth/login';
  url.searchParams.set('next', `${pathname}${search || ''}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/creative-studio/:path*', '/account/:path*', '/api/:path*'],
};

