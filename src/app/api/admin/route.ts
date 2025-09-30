import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Get user to check admin role
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    if (!user || user.publicMetadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Mock admin dashboard data - replace with MongoDB queries
    const dashboardData = {
      stats: {
        totalEvents: 15,
        totalTicketsSold: 1250,
        totalRevenue: 87500,
        activeOrders: 45
      },
      recentOrders: [
        {
          id: 'order_1',
          eventTitle: 'Summer Music Festival 2025',
          customerEmail: 'customer@example.com',
          amount: 150,
          status: 'CONFIRMED',
          date: '2025-01-10T10:00:00Z'
        }
      ],
      upcomingEvents: [
        {
          id: '1',
          title: 'Summer Music Festival 2025',
          date: '2025-07-15',
          ticketsSold: 485,
          totalCapacity: 1000
        }
      ]
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch admin dashboard data' },
      { status: 500 }
    )
  }
}