import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Check if the user is trying to access the Admin Dashboard
  if (path.startsWith('/admin')) {
    
    // 2. Look for our secure custom cookie
    const session = request.cookies.get('ojo_admin_session')?.value;

    // 3. If the cookie is missing or invalid, kick them to the login page!
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow all other pages (and logged-in users) to proceed normally
  return NextResponse.next();
}

// Tell Next.js exactly which routes this bouncer should protect
export const config = {
  matcher: ['/admin/:path*'],
};