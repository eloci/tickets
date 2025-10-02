import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Order } from '@/lib/schemas'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    await connectDB()
    const order = await Order.findById(id)
      .populate({ path: 'event', select: 'title venue address city date time' })
      .populate({ path: 'tickets', populate: { path: 'category', select: 'name price' } })
      .setOptions({ strictPopulate: false })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const response = {
      id: order._id.toString(),
      orderNumber: order.orderNumber || order._id.toString(),
      status: order.status || 'PENDING',
      total: (order.totalAmount || 0).toFixed(2),
      event: {
        title: order.event?.title || 'Unknown Event',
        venue: order.event?.venue || '',
        address: order.event?.address || '',
        city: order.event?.city || '',
        country: '',
        date: order.event?.date ? new Date(order.event.date).toISOString() : '',
        startTime: order.event?.time || '19:00'
      },
      tickets: (order.tickets || []).map((t: any) => ({
        id: t._id.toString(),
        ticketNumber: t.ticketNumber || t._id.toString(),
        category: {
          name: t.category?.name || 'General',
          price: t.category?.price || 0
        }
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Order details error:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}