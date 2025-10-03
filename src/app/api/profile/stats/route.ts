import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/database'
import { Order, User, Ticket } from '@/lib/schemas'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    const email = (session.user as any)?.email
    const authId = (session.user as any)?.id || (session.user as any)?.sub
    let user = await User.findOne(email ? { $or: [{ clerkId: `google:${authId}` }, { email }] } : { clerkId: `google:${authId}` })
    if (!user) {
      user = await User.create({
        clerkId: `google:${authId}`,
        email: email || 'unknown@example.com',
        name: (session.user as any)?.name,
        image: (session.user as any)?.image,
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

    // Member since from user document
    const memberSince = new Date(user.createdAt || Date.now())
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