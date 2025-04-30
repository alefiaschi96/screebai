import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on every request
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession();

  // Get the pathname from the URL
  const { pathname } = req.nextUrl;

  // Define protected routes that require authentication
  const protectedRoutes = ['/games'];
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login'];

  // Special case for /games/screebai - handled by the component itself
  if (pathname.startsWith('/games/screebai')) {
    return res;
  }

  // Check if the current route is protected and user is not authenticated
  if (protectedRoutes.some(route => pathname === route) && !session) {
    // Redirect to login page
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Check if user is on login page but already authenticated
  if (publicRoutes.includes(pathname) && session) {
    // Redirect to home page
    const redirectUrl = new URL('/', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Configure which routes this middleware is applied to
export const config = {
  matcher: [
    // Apply to all routes except for static files, api routes, and _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
