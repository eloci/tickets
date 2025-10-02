import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/database'
import { Order, User, Ticket } from '@/lib/schemas'

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to connect to database
    try {
      await connectDB()
    } catch (dbError) {
      console.error('Database connection failed:', (dbError as Error).message)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Find user by Clerk ID or email
    const clerkUser = await (await import('@clerk/nextjs/server')).currentUser()
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress

    let user = await User.findOne({
      $or: [
        { clerkId: userId },
        { email: userEmail }
      ]
    })

    // Auto-provision user doc if missing
    if (!user && userEmail) {
      user = await User.create({
        clerkId: userId,
        email: userEmail,
        name: clerkUser?.fullName,
        image: clerkUser?.imageUrl,
        role: 'USER'
      })
    }

    // Get orders for this user
    const orders = await Order.find({ user: user._id })
      .populate('event', 'date venue')
      .setOptions({ strictPopulate: false })

    // Calculate stats
    const totalOrders = orders.length
    // Prefer counting tickets directly for accuracy
    const totalTickets = await Ticket.countDocuments({ order: { $in: orders.map(o => o._id) } })
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

    // Count upcoming events (events with future dates)
    const now = new Date()
    const upcomingEvents = orders.filter(order =>
      order.event?.date && new Date(order.event.date) > now
    ).length

    // Find most frequent venue
    const venues = orders
      .map(order => order.event?.venue)
      .filter(Boolean)

    const venueCount = venues.reduce((acc, venue) => {
      acc[venue] = (acc[venue] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const favoriteVenue = Object.keys(venueCount).length > 0
      ? Object.keys(venueCount).reduce((a, b) => venueCount[a] > venueCount[b] ? a : b)
      : 'None'

    // Member since from Clerk user creation date or user document
    const memberSince = new Date(clerkUser?.createdAt || user.createdAt || Date.now())
      .toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      })

    return NextResponse.json({
      totalOrders,
      totalTickets,
      totalSpent,
      upcomingEvents,
      favoriteVenue,
      memberSince
    })
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}