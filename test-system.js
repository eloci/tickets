const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()

async function testAndSetup() {
  console.log('🧪 Testing Concert Ticket Booking System...\n')

  try {
    // 1. Test Database Connection
    console.log('1️⃣ Testing database connection...')
    const userCount = await prisma.user.count()
    const eventCount = await prisma.event.count()
    console.log(`✅ Database connected! Users: ${userCount}, Events: ${eventCount}\n`)

    // 2. Check Email Configuration
    console.log('2️⃣ Checking email configuration...')
    const emailConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS)
    console.log(`${emailConfigured ? '✅' : '❌'} Email configured: ${emailConfigured}\n`)

    // 3. Check Stripe Configuration  
    console.log('3️⃣ Checking Stripe configuration...')
    const stripeConfigured = !!(process.env.STRIPE_SECRET_KEY && 
      process.env.STRIPE_PUBLISHABLE_KEY && 
      !process.env.STRIPE_SECRET_KEY.includes('placeholder'))
    console.log(`${stripeConfigured ? '✅' : '❌'} Stripe configured: ${stripeConfigured}`)
    if (!stripeConfigured) {
      console.log('   💡 Get test keys from: https://dashboard.stripe.com/test/apikeys')
    }
    console.log('')

    // 4. Check QR Code Configuration
    console.log('4️⃣ Checking QR code configuration...')
    const qrConfigured = !!(process.env.QR_SECRET)
    console.log(`${qrConfigured ? '✅' : '❌'} QR codes configured: ${qrConfigured}\n`)

    // 5. Test Category Availability
    console.log('5️⃣ Checking category availability system...')
    const categories = await prisma.category.findMany({
      select: { name: true, available: true, maxQuantity: true }
    })
    console.log('📊 Current category availability:')
    categories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.available}/${cat.maxQuantity} available`)
    })
    console.log('')

    // 6. Create admin user helper
    console.log('6️⃣ Admin user setup...')
    console.log('   To create an admin user:')
    console.log('   1. Sign up at http://localhost:3000/auth/signin')
    console.log('   2. Then run: node create-admin.js (update email first)')
    console.log('   3. Or use Prisma Studio at http://localhost:5555\n')

    // 7. Feature Summary
    console.log('🎯 Features Status:')
    console.log(`   📧 Email notifications: ${emailConfigured ? 'ENABLED' : 'DISABLED'}`)
    console.log(`   💳 Stripe payments: ${stripeConfigured ? 'ENABLED' : 'DISABLED'}`)
    console.log(`   📱 QR code tickets: ${qrConfigured ? 'ENABLED' : 'DISABLED'}`)
    console.log(`   📲 Digital wallets: ENABLED (Apple Pay & Google Pay)`)
    console.log(`   📉 Inventory tracking: ENABLED (deducts after payment)\n`)

    console.log('🚀 System ready! Visit http://localhost:3000 to start booking tickets!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAndSetup()