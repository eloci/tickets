import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
    "/events",
    "/events/(.*)",
    "/api/webhooks(.*)",
    "/api/stripe/webhook",
    "/api/checkout/confirm",
  ],

  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: [
    "/api/health",
  ],
});

export const config = {
  // Skip middleware for static files, public folder, etc.
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};