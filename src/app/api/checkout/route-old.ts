import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/clerk-auth'
import connectDB from '@/lib/database'
import { Order, Ticket, Event, Category, User } from '@/lib/schemas'
import { generateOrderNumber, generateTicketNumber } from '@/lib/utils'
import { generateQRCodeData } from '@/lib/qrcode'

interface OrderItem {
  categoryId: string
  quantity: number
  price: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, items } = await request.json()

    // Ensure user exists in database
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (!user) {
      console.log('User not found, creating:', session.user.id)
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || `user-${session.user.id}@example.com`,
          name: session.user.name || 'User',
          role: session.user.role || 'USER'
        }
      })
    }

    // Validate the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { categories: true }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Validate categories and calculate total
    let total = 0
    const orderItems: OrderItem[] = []

    for (const item of items) {
      const category = event.categories.find(c => c.id === item.categoryId)
      
      if (!category) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }

      // Check against category availability 
      if (item.quantity > category.available) {
        return NextResponse.json({ 
          error: `Only ${category.available} tickets available for ${category.name}` 
        }, { status: 400 })
      }

      if (item.quantity > category.maxQuantity) {
        return NextResponse.json({ 
          error: `Maximum ${category.maxQuantity} tickets allowed for ${category.name}` 
        }, { status: 400 })
      }

      total += parseFloat(category.price.toString()) * item.quantity
      orderItems.push({
        categoryId: item.categoryId,
        quantity: item.quantity,
        price: category.price
      })
    }

    // Create order first
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        eventId: eventId,
        status: 'PENDING',
        total: total,
        orderNumber: `ORD-${Date.now()}`,
        paymentMethod: 'STRIPE'
      }
    })

    // Create tickets with proper QR codes
    const baseTimestamp = Date.now()
    let ticketCounter = 0
    const ticketsToCreate = orderItems.flatMap(item => 
      Array.from({ length: item.quantity }, (_, index) => {
        ticketCounter++
        return {
          orderId: order.id,
          categoryId: item.categoryId,
          qrCode: generateQRCodeData(`${order.id}-${item.categoryId}-${index}`, eventId, session.user.id),
          status: 'ACTIVE' as const,
          ticketNumber: `TKT-${baseTimestamp}-${ticketCounter.toString().padStart(3, '0')}`
        }
      })
    )

    // Create tickets but DON'T deduct availability yet - wait for payment confirmation
    await prisma.ticket.createMany({
      data: ticketsToCreate
    })

    return NextResponse.json({ 
      orderId: order.id, 
      total: order.total
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}