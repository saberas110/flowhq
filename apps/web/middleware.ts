import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for protected dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const accessToken = request.cookies.get('accessToken')?.value;

    // If no access token, redirect to login
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login/register
  if (pathname === '/login' || pathname === '/register') {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};



