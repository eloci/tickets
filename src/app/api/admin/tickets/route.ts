import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from "@/lib/database"
import { User, Ticket, Order, Event, Category } from "@/lib/schemas"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
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

    // Get tickets with populated data
    const tickets = await Ticket.find(query)
      .populate({
        path: 'order',
        populate: [
          { path: 'user', select: 'name email clerkId' },
          { path: 'event', select: 'title date venue' }
        ]
      })
      .populate('category', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const totalTickets = await Ticket.countDocuments(query)

    // Get ticket stats
    const [usedTickets, validTickets, cancelledTickets, totalRevenue] = await Promise.all([
      Ticket.countDocuments({ status: 'USED' }),
      Ticket.countDocuments({ status: 'VALID' }),
      Ticket.countDocuments({ status: 'CANCELLED' }),
      Ticket.aggregate([
        { $match: { status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ])
    ])

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0

    // Format tickets
    const formattedTickets = tickets.map(ticket => ({
      id: ticket._id.toString(),
      ticketNumber: ticket.ticketNumber,
      orderId: ticket.order?._id?.toString() || 'unknown',
      eventId: ticket.order?.event?._id?.toString() || 'unknown',
      eventTitle: ticket.order?.event?.title || 'Unknown Event',
      eventDate: ticket.order?.event?.date?.toISOString() || null,
      userId: ticket.order?.user?.clerkId || 'unknown',
      userName: ticket.order?.user?.name || 'Unknown User',
      userEmail: ticket.order?.user?.email || 'unknown@email.com',
      ticketType: ticket.category?.name || 'Unknown Type',
      price: ticket.price,
      status: ticket.status,
      qrCode: ticket.qrCode || '',
      purchaseDate: ticket.createdAt.toISOString(),
      usedDate: ticket.usedAt?.toISOString() || null
    }))

    return NextResponse.json({
      success: true,
      tickets: formattedTickets,
      stats: {
        totalTickets,
        usedTickets,
        purchasedTickets: validTickets,
        refundedTickets: cancelledTickets,
        totalRevenue: revenue
      },
      pagination: {
        page,
        limit,
        total: totalTickets,
        pages: Math.ceil(totalTickets / limit)
      }
    })

  } catch (error) {
    console.error('❌ Admin Tickets API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}