import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendConfirmationEmail } from '@/lib/email'

// Mock payment route for testing without Stripe
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get the order with all related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        event: true,
        tickets: {
          include: {
            category: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Mock payment success - update order status and deduct availability
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' }
    })

    // Deduct availability from categories (mock the webhook behavior)
    const orderItems = await prisma.ticket.groupBy({
      by: ['categoryId'],
      where: { orderId: orderId },
      _count: { categoryId: true }
    })

    // Update category availability in a transaction
    await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        await tx.category.update({
          where: { id: item.categoryId },
          data: {
            available: {
              decrement: item._count.categoryId
            }
          }
        })
      }
    })

    // Create mock payment record
    await prisma.payment.create({
      data: {
        orderId: orderId,
        amount: order.total,
        status: 'COMPLETED',
        method: 'STRIPE',
        paymentIntentId: `mock_pi_${Date.now()}`,
      }
    })

    // Update ticket status to ACTIVE
    await prisma.ticket.updateMany({
      where: { orderId: orderId },
      data: { status: 'ACTIVE' }
    })

    // Send confirmation email with tickets
    try {
      await sendConfirmationEmail({
        orderId: order.id,
        orderNumber: order.orderNumber,
        userEmail: order.user.email!,
        userName: order.user.name || undefined,
        eventTitle: order.event.title,
        venue: order.event.venue,
        address: order.event.address,
        city: '', // Not available in current Event model
        country: '', // Not available in current Event model
        date: order.event.date,
        doors: order.event.date, // Use event date as fallback
        startTime: order.event.date, // Use event date as fallback
        tickets: order.tickets.map(ticket => ({
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          categoryName: ticket.category.name,
          categoryColor: ticket.category.color,
          price: ticket.category.price
        })),
        total: order.total.toString()
      })
      console.log('✅ Confirmation email sent successfully')
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError)
      // Don't fail the payment if email fails
    }

    // Return mock success URL (simulate successful payment)
    return NextResponse.json({
      url: `${process.env.NEXTAUTH_URL}/orders/${orderId}/confirmation?payment_status=succeeded`
    })

  } catch (error) {
    console.error('Mock payment error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}