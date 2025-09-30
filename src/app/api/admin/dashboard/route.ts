import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    if (user.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    }

    // Mock dashboard data - replace with real database queries when MongoDB is set up
    const dashboardData = {
      stats: {
        totalUsers: 1247,
        totalEvents: 8,
        totalOrders: 342,
        totalTickets: 756,
        totalRevenue: 45680.50,
        upcomingEvents: 3
      },
      recentEvents: [
        {
          id: '1',
          title: 'Summer Music Festival 2025',
          date: '2025-07-15',
          venue: 'Central Park Amphitheater',
          status: 'PUBLISHED'
        },
        {
          id: '2',
          title: 'Rock Concert Extravaganza',
          date: '2025-08-20',
          venue: 'Madison Square Garden',
          status: 'PUBLISHED'
        },
        {
          id: '3',
          title: 'Jazz Night Special',
          date: '2025-10-05',
          venue: 'Blue Note',
          status: 'DRAFT'
        }
      ],
      recentOrders: [
        {
          id: '1',
          event: { title: 'Summer Music Festival 2025' },
          user: { name: 'John Doe', email: 'john@example.com' },
          total: 150.00,
          status: 'CONFIRMED',
          createdAt: '2025-09-28T10:00:00Z'
        },
        {
          id: '2',
          event: { title: 'Rock Concert Extravaganza' },
          user: { name: 'Jane Smith', email: 'jane@example.com' },
          total: 130.00,
          status: 'PENDING',
          createdAt: '2025-09-29T14:30:00Z'
        },
        {
          id: '3',
          event: { title: 'Jazz Night Special' },
          user: { name: 'Mike Johnson', email: 'mike@example.com' },
          total: 95.00,
          status: 'CONFIRMED',
          createdAt: '2025-09-30T09:15:00Z'
        }
      ]
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}