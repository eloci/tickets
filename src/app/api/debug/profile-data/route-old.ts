import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No session found',
        session: session 
      }, { status: 401 })
    }

    // Get all orders for this user
    const allOrders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        event: {
          select: {
            title: true,
            date: true
          }
        },
        tickets: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get order counts by status
    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      where: {
        userId: session.user.id
      },
      _count: {
        status: true
      }
    })

    return NextResponse.json({
      session: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      totalOrders: allOrders.length,
      orderStats,
      orders: allOrders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: order.total,
        createdAt: order.createdAt,
        eventTitle: order.event.title,
        eventDate: order.event.date,
        ticketCount: order.tickets.length
      }))
    })
  } catch (error) {
    console.error('Debug profile data error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch profile data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}