import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { Order, Event, User } from '@/lib/schemas'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      await connectDB()
    } catch (dbError) {
      console.error('Database connection failed:', (dbError as Error).message)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    const clerkUser = await (await import('@clerk/nextjs/server')).currentUser()
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress

    const user = await User.findOne({
      $or: [
        { clerkId: userId },
        { email: userEmail }
      ]
    })

    if (!user) {
      return NextResponse.json([])
    }

    let orderQuery: any = { user: user._id }
    
    if (status !== 'all') {
      orderQuery.status = status.toUpperCase()
    }

    let orders = await Order.find(orderQuery)
      .populate({
        path: 'event',
        select: 'title venue date image'
      })
      .populate({
        path: 'tickets',
        populate: {
          path: 'category',
          select: 'name price'
        }
      })
      .sort({ createdAt: -1 })

    if (search) {
      orders = orders.filter(order => 
        order.event?.title?.toLowerCase().includes(search.toLowerCase()) ||
        order.event?.venue?.toLowerCase().includes(search.toLowerCase())
      )
    }

    const transformedOrders = orders.map(order => ({
      id: order._id.toString(),
      eventTitle: order.event?.title || 'Unknown Event',
      eventDate: order.event?.date ? new Date(order.event.date).toISOString().split('T')[0] : '',
      eventTime: order.event?.date ? new Date(order.event.date).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }) : '',
      venue: order.event?.venue || 'Unknown Venue',
      totalAmount: order.totalAmount || 0,
      currency: order.currency || 'USD',
      status: order.status?.toLowerCase() || 'pending',
      ticketsCount: order.tickets?.length || 0,
      purchaseDate: new Date(order.createdAt).toISOString().split('T')[0],
      eventImage: order.event?.image || null,
      tickets: (order.tickets || []).map((ticket: any) => ({
        id: ticket._id.toString(),
        type: ticket.category?.name || 'General',
        seat: ticket.ticketNumber || `T-${ticket._id.toString().slice(-6)}`,
        price: ticket.category?.price || 0,
        qrCode: ticket.qrCode || '',
        used: ticket.status === 'USED',
        usedAt: ticket.usedAt ? new Date(ticket.usedAt).toISOString() : null
      }))
    }))

    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newOrder = {
      id: `order_${Date.now()}`,
      userId: body.userId,
      eventId: body.eventId,
      totalAmount: body.totalAmount,
      status: 'PENDING',
      orderDate: new Date().toISOString(),
      tickets: body.tickets || []
    }

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}