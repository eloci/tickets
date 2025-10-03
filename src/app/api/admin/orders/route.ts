import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from "@/lib/database"
import { User, Order, Event, Ticket } from "@/lib/schemas"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Enforce admin role from DB user
    const dbUser = await User.findOne({
      $or: [
        { email: session.user.email },
        { clerkId: `google:${session.user.id}` }
      ]
    })
    if (!dbUser || (dbUser.role || 'USER').toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build query
    let query: any = {}
    if (status) {
      query.status = status.toUpperCase()
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Get orders with populated data
    const orders = await Order.find(query)
      .populate('user', 'name email clerkId')
      .populate('event', 'title date venue')
      .populate({
        path: 'tickets',
        populate: {
          path: 'category',
          select: 'name price'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query)

    // Format orders
    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      userId: order.user?.clerkId || order.user?._id?.toString() || 'unknown',
      userName: order.user?.name || 'Unknown User',
      userEmail: order.user?.email || 'unknown@email.com',
      eventId: order.event?._id?.toString() || 'unknown',
      eventTitle: order.event?.title || 'Unknown Event',
      eventDate: order.event?.date?.toISOString() || null,
      totalAmount: order.totalAmount,
      status: order.status,
      orderDate: order.createdAt.toISOString(),
      tickets: order.tickets?.map((ticket: any) => ({
        id: ticket._id.toString(),
        ticketType: ticket.category?.name || 'Unknown Type',
        price: ticket.price,
        status: ticket.status
      })) || []
    }))

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit)
      }
    })

  } catch (error) {
    console.error('❌ Admin Orders API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}