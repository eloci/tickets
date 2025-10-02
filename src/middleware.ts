import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/auth(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/stripe/webhook',
  '/api/checkout/confirm',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  const { userId } = await auth()

  console.log(`[Middleware] Path: ${req.nextUrl.pathname}`)
  console.log(`[Middleware] User ID: ${userId}`)

  if (isAdminRoute(req)) {
    console.log('[Middleware] Admin route detected.')

    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // TEMPORARY: Allow admin access for authenticated users
    // TODO: Fix JWT template to include public_metadata
    console.log('[Middleware] Allowing admin access (temporary bypass)')
    // For now, allow any authenticated user to access admin routes
    // We'll fix the proper role checking once JWT template is working
  }

  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}