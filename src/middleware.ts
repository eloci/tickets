import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Public routes pattern check
const publicMatchers = [
  /^\/$/, /^\/about$/, /^\/contact$/, /^\/terms$/, /^\/privacy$/,
  /^\/events(\/.*)?$/, /^\/past-events$/, /^\/sign-in(\/.*)?$/, /^\/sign-up(\/.*)?$/,
  // Public APIs & webhooks
  /^\/api\/health$/, /^\/api\/events(\/.*)?$/, /^\/api\/webhooks.*$/, /^\/api\/stripe\/webhook$/, /^\/api\/checkout\/confirm$/,
];

function isPublic(pathname: string) {
  return publicMatchers.some((rx) => rx.test(pathname));
}

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Allow public routes straight through
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Protect everything else
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If unauthenticated: APIs get 401 JSON; pages redirect to sign-in
  if (!token) {
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
    const role = (token as any)?.role as string | undefined;

    if (role !== 'ADMIN') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static files and _next
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};