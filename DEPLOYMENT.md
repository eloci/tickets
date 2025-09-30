# Deployment Scripts

## Development Setup
```bash
# 1. Clone repository
git clone <your-repo-url>
cd tickets

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# 4. Set up database
docker run --name tickets-postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=ticketbooking -p 5432:5432 -d postgres:15
npx prisma db push
npx prisma db seed

# 5. Start development server
npm run dev
```

## Production Deployment

### Docker Deployment
```bash
# 1. Build and start services
docker-compose up -d

# 2. Run database migrations
docker-compose exec app npx prisma migrate deploy

# 3. Seed initial data (optional)
docker-compose exec app npx prisma db seed
```

### Manual Deployment
```bash
# 1. Build the application
npm run build

# 2. Set production environment variables
export NODE_ENV=production
export DATABASE_URL="your-production-db-url"
export NEXTAUTH_SECRET="your-secure-secret"

# 3. Run database migrations
npx prisma migrate deploy

# 4. Start the application
npm start
```

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secure string for JWT signing
- `NEXTAUTH_URL` - Full URL of your application

### Payment Providers
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_CLIENT_SECRET` - PayPal client secret

### Email Service
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password/app password
- `FROM_EMAIL` - From email address

### Optional
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `QR_SECRET` - Secret for QR code encryption
- `REDIS_URL` - Redis connection string for caching

## SSL Certificate Setup

### Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (add to crontab)
0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring & Logs

### Application Logs
```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres
```

### Health Checks
- Application: `GET /api/health`
- Database: Included in health check endpoint

## Performance Optimization

### Database
```sql
-- Add indexes for better query performance
CREATE INDEX idx_events_date ON "Event"("date");
CREATE INDEX idx_tickets_status ON "Ticket"("status");
CREATE INDEX idx_orders_user ON "Order"("userId");
```

### Caching
- Enable Redis for session storage
- Implement API response caching
- Use CDN for static assets

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables secured (not in version control)
- [ ] Database credentials rotated
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Prisma)
- [ ] XSS protection headers enabled
- [ ] CSRF protection implemented

## Backup Strategy

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres ticketbooking > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres ticketbooking < backup.sql
```

### Automated Backup (Cron)
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```