# 🎫 Concert Ticket Booking System - Setup Guide

## 🚀 Quick Setup Instructions

### 1. Enable Stripe Payments (Required for full functionality)

1. **Create Stripe Account (Free)**
   - Go to https://dashboard.stripe.com/register
   - Sign up for a free Stripe account

2. **Get Test API Keys**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy your "Publishable key" (starts with `pk_test_`)
   - Copy your "Secret key" (starts with `sk_test_`)

3. **Update .env.local**
   ```bash
   STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_ACTUAL_KEY_HERE"
   STRIPE_SECRET_KEY="sk_test_YOUR_ACTUAL_KEY_HERE"
   ```

### 2. Create Admin User

1. **Sign up first**: Go to http://localhost:3000/auth/signin
2. **Update create-admin.js**: Change the email to your registered email
3. **Run**: `node create-admin.js`

### 3. Test Everything

Run the system test: `node test-system.js`

## ✅ What's Already Enabled

- 📧 **Email Notifications**: Configured with Brevo/Sendinblue
- 📱 **QR Code Tickets**: Enabled with secure signing
- 📲 **Digital Wallets**: Apple Wallet & Google Pay ready
- 📉 **Inventory Tracking**: Fixed - deducts after successful payment
- 🔐 **Authentication**: NextAuth with Google OAuth support

## 🎯 How the Fixed System Works

### Availability Deduction Fix
- **Before**: Tickets were reserved immediately (could cause issues if payment failed)
- **After**: Availability is only deducted AFTER successful Stripe payment
- **Result**: No more phantom unavailable tickets!

### Payment Flow
1. User selects tickets → Order created (PENDING status)
2. Stripe processes payment
3. Webhook confirms payment → Order status = CONFIRMED
4. **Availability deducted** from categories
5. Confirmation email sent with QR codes & wallet passes

### Features Ready to Use
- ✅ Real-time inventory management
- ✅ Secure QR code validation
- ✅ Email confirmations with attachments
- ✅ Apple Wallet & Google Pay integration
- ✅ Admin dashboard for event management
- ✅ Mobile-responsive design

## 🧪 Testing Guide

1. **Add Stripe keys** (see above)
2. **Run**: `node test-system.js` (should show all green ✅)
3. **Create admin user** and add events
4. **Test booking flow**: Select tickets → Pay with Stripe test cards
5. **Check availability**: Should decrease after successful payment
6. **Verify email**: Check confirmation email with QR codes

## 🎫 Stripe Test Cards

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Use any future date for expiry, any 3-digit CVC

## 🔧 Need Help?

- **Stripe Setup**: https://stripe.com/docs/testing
- **System Status**: Run `node test-system.js`
- **Admin Access**: Use Prisma Studio at http://localhost:5555