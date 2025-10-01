import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { EventsStorage } from '@/lib/storage/events'
import { TicketsStorage } from '@/lib/storage/tickets'

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

    // Get real data from storage
    const events = EventsStorage.getAll()
    const ticketsStats = TicketsStorage.getStats()
    
    // Calculate stats from real data
    const stats = {
      totalUsers: 0, // We don't have user storage yet
      totalEvents: events.length,
      totalOrders: 0, // We don't have order storage yet
      totalTickets: ticketsStats.totalTickets,
      totalRevenue: ticketsStats.totalRevenue,
      upcomingEvents: events.filter(event => event.status === 'PUBLISHED').length
    }

    // Get recent events (latest 5)
    const recentEvents = events
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        venue: event.venue,
        status: event.status
      }))

    // For now, return empty orders since we don't have order storage
    const recentOrders: any[] = []

    const dashboardData = {
      stats,
      recentEvents,
      recentOrders
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}