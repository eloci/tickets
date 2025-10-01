import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    stats: {
      totalUsers: 0,
      totalEvents: 0,
      totalOrders: 0,
      totalTickets: 0,
      totalRevenue: 0,
      upcomingEvents: 0
    },
    recentEvents: [],
    recentOrders: []
  })
}
