# Payment System Setup Guide

## Current Status ✅

Your application is now running with a **mock payment system** for development. All features are working:

- ✅ Ticket selection and shopping cart
- ✅ Order creation with inventory management  
- ✅ Mock payment processing (instant success)
- ✅ Email notifications with QR codes
- ✅ Digital wallet integration (Apple Wallet & Google Pay)
- ✅ Availability deduction after payment confirmation
- ✅ Order confirmation and ticket management

## Testing the System

1. **Start the server**: `npm run dev` (running on http://localhost:3001)
2. **Sign in** using Google OAuth or create an account
3. **Browse events** and select tickets
4. **Proceed to checkout** - the system will automatically use mock payment
5. **Check your email** for confirmation with QR codes
6. **View your order** in the confirmation page

## Setting Up Real Stripe Payments

To enable real payment processing with Stripe:

### 1. Get Stripe API Keys

1. Visit [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Create a free account or sign in
3. Go to **Developers** → **API Keys**
4. Copy your **Publishable key** and **Secret key** (use test keys for development)

### 2. Update Environment Variables

Edit your `.env.local` file and replace the placeholder values:

```env
# Replace these placeholder values with your real Stripe keys
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_REAL_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_REAL_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### 3. Set Up Webhooks (Optional for development)

For production, you'll need to set up webhooks:

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://yourdomain.com/api/stripe/webhook`
4. Select event: `checkout.session.completed`
5. Copy the webhook secret to your `.env.local`

## Mock Payment System

While Stripe is not configured, the app uses a mock payment system that:

- ✅ Simulates successful payments instantly
- ✅ Processes orders and reduces ticket availability  
- ✅ Sends confirmation emails with QR codes
- ✅ Creates digital wallet passes
- ✅ Updates order status to "CONFIRMED"

This allows full testing of the application flow without real payment processing.

## Features Included

### 🎫 Ticket Management
- Multiple ticket categories per event
- Real-time availability tracking
- Shopping cart with quantity selection
- Price calculation with totals

### 💳 Payment Processing
- Stripe integration (when configured)
- Mock payment system (development)
- Order status tracking
- Payment confirmation webhooks

### 📧 Email Notifications
- HTML email templates
- QR code generation and attachment
- Digital wallet pass downloads
- SMTP via Brevo/Sendinblue

### 📱 Digital Wallets
- Apple Wallet (.pkpass files)
- Google Pay passes
- QR codes embedded in passes
- Location-based notifications

### 🔐 Security
- Cryptographically signed QR codes
- Timestamp validation (24h expiry)
- Secure ticket validation
- Role-based access control

### 👤 User Management
- NextAuth with Google OAuth
- Role-based permissions (USER/ORGANIZER/ADMIN)
- Order history and ticket management
- Account settings and preferences

## Troubleshooting

### Payment Issues
- If you see "Internal server error" during checkout, check the terminal for Stripe warnings
- The mock payment system should work automatically when Stripe is not configured
- Check `.env.local` for proper API key format

### Email Issues
- Verify Brevo/Sendinblue SMTP settings in `.env.local`
- Check spam folder for confirmation emails
- Ensure email service is properly configured

### Database Issues
- Run `npx prisma generate` after schema changes
- Use `npx prisma db push` to sync database
- Check SQLite database file exists and is writable

## Next Steps

1. **Test the application** with the current mock payment system
2. **Set up Stripe** when ready for real payment processing  
3. **Configure production email** service for live environment
4. **Set up domain and SSL** for production deployment

The application is fully functional and ready for development and testing!