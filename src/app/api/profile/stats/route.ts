import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { Order, User } from '@/lib/schemas'

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

    const user = await User.findOne({
      $or: [
        { clerkId: userId },
        { email: userEmail }
      ]
    })

    if (!user) {
      // Return default stats for users not in database yet
      return NextResponse.json({
        totalOrders: 0,
        totalTickets: 0,
        totalSpent: 0,
        upcomingEvents: 0,
        favoriteVenue: 'None',
        memberSince: new Date(clerkUser?.createdAt || Date.now()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        })
      })
    }

    // Get orders for this user
    const orders = await Order.find({ user: user._id })
      .populate('event', 'date venue')
      .populate('tickets')

    // Calculate stats
    const totalOrders = orders.length
    const totalTickets = orders.reduce((sum, order) => sum + (order.tickets?.length || 0), 0)
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