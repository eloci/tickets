import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
    "/events",
    "/past-events",
    "/sign-in",
    "/sign-up",
    "/api/webhooks(.*)",
    "/api/stripe/webhook",
    "/api/checkout/confirm",
    "/api/health",
    "/events/(.*)",
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};