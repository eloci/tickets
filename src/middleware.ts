import { NextResponse, type NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes using Clerk helpers for clarity and maintainability
const isPublicRoute = createRouteMatcher([
  '/', '/about', '/contact', '/terms', '/privacy',
  '/events', '/events/(.*)', '/past-events',
  '/sign-in', '/sign-up',
  // Public APIs & webhooks
  '/api/health', '/api/events', '/api/events/(.*)',
  '/api/webhooks(.*)', '/api/stripe/webhook', '/api/checkout/confirm',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname, search } = req.nextUrl;

  // Allow public routes straight through
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect everything else
  const { userId, sessionClaims } = await auth();

  // If unauthenticated: APIs get 401 JSON; pages redirect to sign-in
  if (!userId) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const signInUrl = new URL('/sign-in', req.url);
    const original = pathname + (search || '');
    signInUrl.searchParams.set('redirect_url', original);
    return NextResponse.redirect(signInUrl);
  }

  // Admin-only gate
  if (pathname.startsWith('/admin')) {
    // Prefer publicMetadata.role (common) and fall back to metadata.role if your JWT includes it
    const role =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sessionClaims as any)?.publicMetadata?.role ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sessionClaims as any)?.metadata?.role;

    if (role !== 'ADMIN') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  // Run on all routes except static files and _next
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};