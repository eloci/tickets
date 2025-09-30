# Copilot Instructions for Concert Ticket Booking System

This is a Next.js 14 full-stack application for concert ticket booking with QR codes, wallet integration, and multiple payment methods.

## Architecture Overview
- **Frontend:** Next.js 14 with TypeScript, Tailwind CSS, and React components
- **Backend:** Next.js API routes with server-side logic
- **Database:** PostgreSQL with Prisma ORM for type-safe database operations
- **Authentication:** NextAuth.js with Google OAuth and credentials provider
- **Payments:** Stripe (cards), PayPal, Apple Pay, Google Pay integration
- **Email:** Nodemailer with HTML templates and QR code attachments
- **QR Codes:** Crypto-signed QR codes for secure ticket validation
- **Mobile Wallets:** Apple Wallet (.pkpass) and Google Pay pass generation

## Key Directories
- `src/app/` - Next.js 14 App Router pages and API routes
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions (auth, prisma, stripe, email, QR codes)
- `prisma/` - Database schema and migrations
- `src/types/` - TypeScript type definitions

## Critical Workflows

### Database Operations
```bash
npx prisma generate    # Generate Prisma client after schema changes
npx prisma db push     # Push schema changes to database
npx prisma migrate dev # Create and apply migrations
```

### Development Server
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
```

### Payment Integration
- Stripe: Uses Checkout Sessions for secure payment processing
- PayPal: Integrated with @paypal/react-paypal-js
- Apple/Google Pay: Browser-native payment methods
- All payments create Order records before processing

### QR Code System
- QR codes contain encrypted ticket data with HMAC signatures
- Validation includes timestamp checks (24h expiry)
- Scanning updates ticket status to 'USED' with timestamp
- Admin scanning interface at `/admin/scan`

### Email System
- HTML emails with embedded QR code images
- Wallet pass download links included
- Nodemailer with SMTP configuration
- Templates use inline CSS for email client compatibility

## Database Schema Patterns
- **Users:** NextAuth.js compatible with roles (USER, ADMIN, ORGANIZER)
- **Events:** Concert events with categories (ticket types)
- **Orders:** Shopping cart to payment flow with status tracking
- **Tickets:** Individual tickets with QR codes and usage tracking
- **Payments:** Separate payment record for audit trail

## Security Considerations
- CSRF protection via middleware
- SQL injection prevention with Prisma
- QR code cryptographic signatures
- Environment variable validation
- Rate limiting on payment endpoints
- HTTPS enforcement in production

## Mobile Wallet Integration
- Apple Wallet: Generates .pkpass files with event details and QR codes
- Google Pay: JWT-signed pass objects for Google Pay API
- Automatic pass updates when ticket status changes
- Location-based notifications for venue proximity

## Admin Features
- Event creation with multiple ticket categories
- Real-time ticket scanning with validation
- Sales analytics and attendance tracking
- Order management and refund processing
- QR code validation dashboard

## Common Development Patterns
- Use `getServerSession(authOptions)` for server-side auth
- Database queries through `prisma` client from `@/lib/prisma`
- Error handling with try/catch and appropriate HTTP status codes
- Type safety with Prisma-generated types
- Toast notifications with react-hot-toast
- Form validation with client and server-side checks

## Payment Flow
1. User selects tickets → Shopping cart
2. Checkout creates pending Order with Tickets
3. Payment processor handles secure payment
4. Webhook confirms payment → Order status CONFIRMED
5. Email sent with QR codes and wallet passes
6. QR codes scanned at venue for entry

## Deployment
- Docker containerization with multi-stage builds
- PostgreSQL and Redis via Docker Compose
- Environment variable configuration
- Health check endpoints at `/api/health`
- Production optimizations in `next.config.js`

When working with this codebase, always check existing patterns in similar components and follow the established authentication, database, and error handling conventions.