import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import connectDB from "@/lib/database"
import { User, Order, Event, Ticket } from "@/lib/schemas"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Check if user is admin
    let user = await User.findOne({ clerkId: userId })

    // If user doesn't exist in our database, create them as admin (for development)
    if (!user) {
      console.log('User not found in database, creating with admin role:', userId)
      try {
        user = await User.create({
          clerkId: userId,
          email: 'admin@admin.com',
          role: 'ADMIN'
        })
      } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
    }

    if (user.role !== 'ADMIN') {
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
      userId: order.user?.clerkId || 'unknown',
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