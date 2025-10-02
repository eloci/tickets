import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/terms",
  "/privacy", 
  "/events",
  "/events/(.*)",
  "/sign-in",
  "/sign-up",
  "/api/webhooks(.*)",
  "/api/stripe/webhook",
  "/api/checkout/confirm",
  "/api/health"
];

export default clerkMiddleware((req: NextRequest) => {
  // Check if the request is for a public route
  const url = req.nextUrl.clone();
  const path = url.pathname;
  
  const isPublicRoute = publicRoutes.some(route => {
    if (route.endsWith('(.*)')) {
      const baseRoute = route.replace('(.*)', '');
      return path === baseRoute || path.startsWith(baseRoute);
    }
    return path === route;
  });

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For all other routes, Clerk will handle authentication
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/image|_next/static|favicon.ico).*)', '/'],
};