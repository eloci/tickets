import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    console.log(`[Middleware] Path: ${pathname}`)
    console.log(`[Middleware] User: ${token?.email || 'None'}`)

    // Admin route protection
    if (pathname.startsWith('/admin')) {
      console.log('[Middleware] Admin route detected.')
      
      if (!token) {
        console.log('[Middleware] No token, redirecting to signin')
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }

      // For now, allow any authenticated user to access admin routes
      // TODO: Implement proper role-based authorization
      console.log('[Middleware] Allowing admin access')
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes that don't require authentication
        const publicRoutes = [
          '/',
          '/about',
          '/contact',
          '/terms',
          '/privacy',
          '/events',
          '/auth/signin',
          '/auth/signup',
          '/api/webhooks',
          '/api/stripe/webhook',
          '/api/checkout/confirm',
        ]

        // Check if it's a public route or starts with a public path
        const isPublic = publicRoutes.some(route => 
          pathname === route || pathname.startsWith('/events/') || pathname.startsWith('/api/stripe/')
        )

        if (isPublic) {
          return true
        }

        // Admin routes require authentication
        if (pathname.startsWith('/admin')) {
          return !!token
        }

        // Other protected routes require authentication
        return !!token
      }
    }
  }
)

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}