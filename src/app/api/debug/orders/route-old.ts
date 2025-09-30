import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all orders in the database to see what exists
    const allOrders = await prisma.order.findMany({
      include: {
        event: true,
        user: true,
        tickets: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get orders specifically for this user
    const userOrders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        event: true,
        tickets: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      currentUser: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      totalOrdersInDb: allOrders.length,
      userOrderCount: userOrders.length,
      allOrders: allOrders.map(order => ({
        id: order.id,
        userId: order.userId,
        userEmail: order.user.email,
        status: order.status,
        totalAmount: order.total,
        createdAt: order.createdAt,
        eventTitle: order.event.title,
        ticketCount: order.tickets.length
      })),
      userOrders: userOrders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: order.total,
        createdAt: order.createdAt,
        eventTitle: order.event.title,
        ticketCount: order.tickets.length
      }))
    })

  } catch (error) {
    console.error('Error fetching debug info:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}