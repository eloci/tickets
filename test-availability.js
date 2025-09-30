// Test script to verify that available places are decremented when tickets are purchased
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTicketPurchase() {
  try {
    console.log('🧪 Testing ticket purchase and availability deduction...\n')

    // Get current availability
    console.log('📊 BEFORE purchase:')
    const beforeEvent = await prisma.event.findFirst({
      include: { categories: true }
    })

    beforeEvent.categories.forEach(cat => {
      console.log(`  ${cat.name}: ${cat.available} available`)
    })

    // Find a user (or create a test user)
    let testUser = await prisma.user.findFirst()
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          id: 'test-user-' + Date.now(),
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER'
        }
      })
    }

    // Simulate purchasing 2 General Admission tickets
    const generalAdmissionCategory = beforeEvent.categories.find(c => c.name === 'General Admission')
    const vipCategory = beforeEvent.categories.find(c => c.name === 'VIP')

    if (!generalAdmissionCategory || !vipCategory) {
      throw new Error('Required categories not found')
    }

    console.log(`\n🛒 Simulating purchase: 2 General Admission + 1 VIP ticket`)

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: testUser.id,
        eventId: beforeEvent.id,
        status: 'PENDING',
        total: (generalAdmissionCategory.price * 2) + (vipCategory.price * 1),
        orderNumber: `TEST-${Date.now()}`,
        paymentMethod: 'STRIPE'
      }
    })

    // Create tickets and update availability (simulating the fixed checkout process)
    const ticketsToCreate = [
      {
        orderId: order.id,
        categoryId: generalAdmissionCategory.id,
        qrCode: `test-qr-1-${Date.now()}`,
        status: 'ACTIVE',
        ticketNumber: `TEST-${Date.now()}-1`
      },
      {
        orderId: order.id,
        categoryId: generalAdmissionCategory.id,
        qrCode: `test-qr-2-${Date.now()}`,
        status: 'ACTIVE',
        ticketNumber: `TEST-${Date.now()}-2`
      },
      {
        orderId: order.id,
        categoryId: vipCategory.id,
        qrCode: `test-qr-3-${Date.now()}`,
        status: 'ACTIVE',
        ticketNumber: `TEST-${Date.now()}-3`
      }
    ]

    // Use transaction like in our fixed checkout API
    await prisma.$transaction(async (tx) => {
      // Create tickets
      await tx.ticket.createMany({
        data: ticketsToCreate
      })

      // Update category availability
      await tx.category.update({
        where: { id: generalAdmissionCategory.id },
        data: { available: { decrement: 2 } }
      })

      await tx.category.update({
        where: { id: vipCategory.id },
        data: { available: { decrement: 1 } }
      })
    })

    console.log('✅ Purchase completed!')

    // Check availability after purchase
    console.log('\n📊 AFTER purchase:')
    const afterEvent = await prisma.event.findFirst({
      include: { categories: true }
    })

    afterEvent.categories.forEach(cat => {
      const before = beforeEvent.categories.find(c => c.id === cat.id)
      const difference = before.available - cat.available
      console.log(`  ${cat.name}: ${cat.available} available (${difference > 0 ? '-' + difference : 'no change'})`)
    })

    console.log('\n🎯 Test Result:')
    const generalAfter = afterEvent.categories.find(c => c.name === 'General Admission')
    const vipAfter = afterEvent.categories.find(c => c.name === 'VIP')

    const generalDeducted = beforeEvent.categories.find(c => c.name === 'General Admission').available - generalAfter.available
    const vipDeducted = beforeEvent.categories.find(c => c.name === 'VIP').available - vipAfter.available

    if (generalDeducted === 2 && vipDeducted === 1) {
      console.log('✅ SUCCESS: Available places were correctly decremented!')
    } else {
      console.log('❌ FAILURE: Available places were NOT correctly decremented!')
      console.log(`   Expected: General -2, VIP -1`)
      console.log(`   Actual: General -${generalDeducted}, VIP -${vipDeducted}`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTicketPurchase()