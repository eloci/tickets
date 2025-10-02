import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/about",
    "/contact", 
    "/terms",
    "/privacy",
    "/events",
    "/past-events",
    "/sign-in",
    "/sign-up",
    "/api/health",
  ];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(`${route}/`) ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/api/checkout/confirm') ||
    pathname.startsWith('/events/')
  );
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For protected routes, check authentication
  try {
    const { userId } = await auth();
    
    if (!userId) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};