import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import connectDB from "@/lib/database"
import { User, Event, Order, Ticket } from "@/lib/schemas"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // For development - temporarily allow all authenticated users to access admin dashboard
    // Or check if user is admin and create them if needed
    let user = await User.findOne({ clerkId: userId })

    if (!user) {
      console.log('Creating new admin user for:', userId)
      // Create user as admin for development
      user = await User.create({
        clerkId: userId,
        email: 'admin@example.com', // This will be updated later
        role: 'ADMIN'
      })
    }

    // For development, make any user admin if they're not already
    if (user.role !== 'ADMIN') {
      console.log('Upgrading user to admin role:', userId)
      user.role = 'ADMIN'
      await user.save()
    }

    console.log('Admin access granted for user:', userId)

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
