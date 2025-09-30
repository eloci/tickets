# Concert Ticket Booking System

A comprehensive Next.js 14 full-stack application for booking concert tickets with QR codes, mobile wallet integration, and multiple payment methods.

## 🎵 Features

### Core Functionality
- **Event Management**: Create and manage concert events with multiple ticket categories
- **Ticket Booking**: Interactive seat selection and shopping cart experience
- **Payment Processing**: Multiple payment methods (Stripe, PayPal, Apple Pay, Google Pay)
- **QR Code Tickets**: Cryptographically signed QR codes for secure entry validation
- **Mobile Wallets**: Apple Wallet and Google Pay integration for ticket storage
- **Email Notifications**: Rich HTML emails with QR codes and wallet pass links

### Admin Features
- **Event Dashboard**: Real-time analytics and ticket sales monitoring
- **QR Code Scanner**: Mobile-optimized ticket validation interface
- **Order Management**: View, refund, and manage customer orders
- **User Management**: Role-based access (User, Admin, Organizer)

### Security & Production Ready
- **Authentication**: NextAuth.js with OAuth and credential providers
- **Data Validation**: Type-safe database operations with Prisma
- **Security Headers**: CSRF protection, XSS prevention, and secure cookies
- **Docker Support**: Multi-stage production builds with health checks
- **SSL/HTTPS**: Ready for production deployment with proper certificates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Docker (optional)

### Environment Setup
```bash
# 1. Clone and install
git clone <your-repo>
cd tickets
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database and API keys

# 3. Database setup
npx prisma generate
npx prisma db push

# 4. Start development
npm run dev
```

### Docker Deployment
```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js 14 App Router
│   ├── api/            # API routes (payments, tickets, admin)
│   ├── admin/          # Admin dashboard pages
│   ├── auth/           # Authentication pages
│   └── checkout/       # Checkout flow pages
├── components/         # Reusable React components
│   ├── admin/          # Admin-specific components
│   └── ui/             # UI components
├── lib/                # Utility libraries
│   ├── auth.ts         # NextAuth configuration
│   ├── prisma.ts       # Database client
│   ├── stripe.ts       # Payment processing
│   ├── qrcode.ts       # QR code generation/validation
│   └── email.ts        # Email templates and sending
├── types/              # TypeScript type definitions
└── middleware.ts       # Route protection and CORS

prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migrations
```

## 🎫 How It Works

### Ticket Booking Flow
1. **Browse Events**: Users view available concerts and ticket categories
2. **Select Tickets**: Interactive cart with quantity limits and real-time availability
3. **Secure Checkout**: Multiple payment options with fraud protection
4. **Instant Delivery**: QR codes and wallet passes sent via email immediately
5. **Entry Validation**: QR codes scanned at venue with real-time verification

### Payment Processing
- **Stripe**: Credit/debit cards with 3D Secure support
- **PayPal**: PayPal account and guest checkout
- **Apple Pay**: Touch ID/Face ID authentication
- **Google Pay**: Secure tokenized payments
- **Webhook Handling**: Automatic order confirmation and ticket generation

### QR Code Security
- **HMAC Signatures**: Cryptographically signed with secret key
- **Timestamp Validation**: Prevents replay attacks with 24-hour expiry
- **Event Verification**: Links ticket to specific event and user
- **One-Time Use**: Automatic marking as 'USED' when scanned

## 🔧 Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/tickets"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Payments
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
PAYPAL_CLIENT_ID="your-paypal-client-id"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Security
QR_SECRET="your-qr-encryption-key"
```

### Payment Provider Setup
1. **Stripe**: Create account at stripe.com, enable Apple Pay/Google Pay
2. **PayPal**: Create business account, get REST API credentials
3. **Mobile Wallets**: Configure domain verification and merchant IDs

## 📱 Mobile Wallet Integration

### Apple Wallet
- Generates `.pkpass` files with event details
- Location-based notifications for venue proximity
- Automatic updates when ticket status changes
- Barcode scanning with Camera app

### Google Pay
- JWT-signed pass objects for secure validation
- Integration with Google Pay app and Chrome browser
- Rich metadata including venue address and event times
- Offline access to tickets

## 🔒 Security Features

- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Prevention**: Content Security Policy headers
- **CSRF Protection**: Built-in middleware validation
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Server-side validation for all user inputs
- **Secure Sessions**: HTTP-only cookies with secure flags

## 🚀 Deployment

### Production Requirements
- **SSL Certificate**: Required for mobile wallet features
- **PostgreSQL**: Database with connection pooling
- **Redis** (Optional): For session storage and caching
- **SMTP Service**: For sending ticket emails
- **CDN** (Optional): For static asset delivery

### Docker Production Deployment
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# SSL with Let's Encrypt
certbot --nginx -d yourdomain.com
```

## 📊 Monitoring & Analytics

### Built-in Analytics
- **Real-time Sales**: Track ticket sales by event and category
- **Attendance Tracking**: QR code scanning statistics
- **Revenue Reports**: Payment breakdowns by method
- **User Activity**: Registration and booking patterns

### Health Monitoring
- **Health Check Endpoint**: `/api/health` for load balancer integration
- **Database Connectivity**: Automatic connection testing
- **Error Logging**: Comprehensive error tracking and reporting

## 🎨 Customization

### Branding
- Update `tailwind.config.js` for custom colors and fonts
- Replace logo and images in `public/` directory
- Customize email templates in `src/lib/email.ts`

### Features
- Add new ticket categories in database schema
- Extend payment methods by adding new API routes
- Customize QR code design and validation logic
- Add integration with external ticketing systems

## 📞 Support & Contributing

### Getting Help
- Check existing issues and discussions
- Review deployment documentation
- Join our community Discord server

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Submit a pull request with description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the music community. Perfect for concerts, festivals, and live events of any size.
