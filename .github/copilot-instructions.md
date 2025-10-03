# Copilot Instructions – Tickets App

Next.js full‑stack app for concert tickets: Stripe checkout, crypto‑signed QR codes, email delivery, and mobile wallet passes.

## Architecture & Key Paths
- App Router: `src/app/*` (pages + API). Shared libs in `src/lib/*`. UI in `src/components/*`.
- Auth: Clerk. See `src/middleware.ts` for route protection and admin gating via `sessionClaims.publicMetadata.role === 'ADMIN'`. Helpers in `src/lib/clerk-auth.ts`.
- Database: MongoDB via Mongoose (not Prisma). Connection in `src/lib/database.ts`; models in `src/lib/schemas.ts`.
- Payments: Stripe Checkout. Core helpers in `src/lib/stripe.ts`; order finalization in `src/lib/stripe-order.ts`.
- QR & Email: HMAC‑signed QR in `src/lib/qr-generator.ts`; Nodemailer HTML with inline QR in `src/lib/email-service.ts`.
- Wallet: Apple/Google passes in `src/lib/wallet-generator.ts`; endpoints at `/api/wallet/{apple|google}/[ticketId]`.

## Run & Build
- Dev: `npm run dev` (Next 15, React 19, Turbopack).
- Build/Start: `npm run build` → `npm start`.
- Stripe webhook (production path): `POST /api/stripe/webhook` with `STRIPE_WEBHOOK_SECRET`.
- Note: Docker/compose files mention Postgres/Prisma but app actually uses MongoDB. Use `DATABASE_URL` as a Mongo connection string.

## Access Control Patterns
- Public routes declared in `src/middleware.ts` via `createRouteMatcher([...])`.
- Unauthed API requests → JSON 401; pages → redirect to `/sign-in` with `redirect_url` param.
- Admin pages under `/admin` require `publicMetadata.role === 'ADMIN'` (or `metadata.role` fallback).

## Data Model (Mongoose)
- `User`: `{ clerkId, email, name, image, role: 'USER'|'ADMIN'|'ORGANIZER' }`.
- `Event`, `Category`(ticket tier with `totalTickets/soldTickets`), `Order`(virtual `tickets`), `Ticket`(`status: VALID|USED|CANCELLED`), `Payment`.
- Connect once via `connectDB()` before DB ops (see `stripe-order.finalizeOrder`).

## Checkout → Fulfillment Flow
1) Client posts to `POST /api/checkout` with event and `tickets[]` → server creates Stripe Checkout Session (`lib/stripe.createCheckoutSession`).
2) On completion, either:
	- Webhook `checkout.session.completed` → `finalizeOrder`, or
	- Client call `POST /api/checkout/confirm` with `{ sessionId }` → `finalizeOrder`.
3) `finalizeOrder` creates `Order`, issues `Ticket`s, updates `Category.soldTickets`, and sends email via `sendTicketEmail`.
	- Idempotency: skips if `paymentIntentId` already processed.

## QR & Email Details
- QR: `qr-generator.ts` signs JSON with HMAC SHA‑256 using `QR_SECRET_KEY` or `QR_SECRET`.
- Expiry: 24h after event date/time; `validateQRCode()` enforces expiry and signature.
- Email: `email-service.ts` embeds QR images via `cid:qr-<ticketId>`; includes wallet links pointing to `/api/wallet/...`.

## Wallet Passes
- Apple: `generateAppleWalletPass()` with `passkit-generator` and certificate files under `./certificates/*` (you must provide).
- Google: `generateGooglePayPass()` returns a JWT placeholder; in production, sign with your Google key.
- Current API routes use mock ticket data—replace with DB lookup by `ticketId`.

## Conventions & Gotchas
- Prefer Clerk helpers: `getAuthUser()/requireAuth()` from `src/lib/clerk-auth.ts` in server components/actions.
- Stripe: require `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- SMTP: set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, optional `SENDER_EMAIL`.
- Env: `DATABASE_URL` (Mongo), `QR_SECRET_KEY|QR_SECRET`, Clerk envs.
- `next.config.ts` ignores ESLint/TS errors during build; keep changes type‑safe locally.

Examples
- Create checkout session: `POST /api/checkout` body shape matches `CreateCheckoutSessionData` in `src/lib/stripe.ts`.
- Manually confirm order after redirect: `POST /api/checkout/confirm { sessionId }`.

Notes
- README and Docker mention Postgres/Prisma; these are legacy. Use Mongoose models and MongoDB in this codebase.