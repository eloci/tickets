import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/database"
import { User, Event, Order, Ticket } from "@/lib/schemas"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()

    // Enforce admin role
    const dbUser = await User.findOne({ $or: [{ email: session.user.email }, { clerkId: `google:${session.user.id}` }] })
    if (!dbUser || (dbUser.role || "USER").toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get current date for upcoming events calculation
    const now = new Date()

    // Aggregate stats
    const [
      totalUsers,
      totalEvents,
      totalOrders,
      totalTickets,
      upcomingEvents,
      revenueResult,
      recentEvents,
      recentOrders
    ] = await Promise.all([
      // Total users count
      User.countDocuments(),

      // Total events count
      Event.countDocuments({ status: 'PUBLISHED' }),

      // Total confirmed orders count
      Order.countDocuments({ status: 'CONFIRMED' }),

      // Total tickets count
      Ticket.countDocuments(),

      // Upcoming events count
      Event.countDocuments({
        status: 'PUBLISHED',
        date: { $gte: now }
      }),

      // Total revenue from confirmed orders
      Order.aggregate([
        { $match: { status: 'CONFIRMED' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),

      // Recent events (last 5)
      Event.find({ status: 'PUBLISHED' })
        .populate('organizer', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title date venue status createdAt'),

      // Recent orders (last 10)
      Order.find({ status: 'CONFIRMED' })
        .populate('user', 'name email')
        .populate('event', 'title')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber totalAmount status createdAt user event')
    ])

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    // Format recent events
    const formattedRecentEvents = recentEvents.map(event => ({
      id: event._id.toString(),
      title: event.title,
      date: event.date.toISOString(),
      venue: event.venue || 'TBA',
      status: event.date >= now ? 'upcoming' : 'past'
    }))

    // Format recent orders
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order._id.toString(),
      event: { title: order.event?.title || 'Unknown Event' },
      user: {
        name: order.user?.name || 'Unknown User',
        email: order.user?.email || 'unknown@email.com'
      },
      total: order.totalAmount,
      status: order.status.toLowerCase(),
      createdAt: order.createdAt.toISOString()
    }))

    return NextResponse.json({
      stats: {
        totalUsers,
        totalEvents,
        totalOrders,
        totalTickets,
        totalRevenue,
        upcomingEvents
      },
      recentEvents: formattedRecentEvents,
      recentOrders: formattedRecentOrders
    })
  } catch (error) {
    console.error('❌ Dashboard API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
