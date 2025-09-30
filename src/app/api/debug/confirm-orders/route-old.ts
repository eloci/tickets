import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Debug endpoint disabled - feature needs reimplementation' 
  }, { status: 501 })
}
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId } = body

    if (orderId) {
      // Confirm a specific order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          event: true,
          tickets: true
        }
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      if (order.userId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      // Update order status to CONFIRMED
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' }
      })

      return NextResponse.json({
        success: true,
        message: 'Order confirmed successfully',
        order: {
          id: updatedOrder.id,
          status: updatedOrder.status,
          eventTitle: order.event.title,
          ticketCount: order.tickets.length
        }
      })
    } else {
      // Confirm all pending orders (existing functionality)
      const pendingOrders = await prisma.order.findMany({
        where: {
          userId: session.user.id,
          status: 'PENDING'
        }
      })

      const updatedOrders = await prisma.order.updateMany({
        where: {
          userId: session.user.id,
          status: 'PENDING'
        },
        data: {
          status: 'CONFIRMED'
        }
      })

      return NextResponse.json({
        success: true,
        message: `Confirmed ${updatedOrders.count} orders`,
        confirmedOrderIds: pendingOrders.map(order => order.id)
      })
    }

  } catch (error) {
    console.error('Error confirming order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to confirm all pending orders for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all pending orders for the user
    const pendingOrders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: 'PENDING'
      }
    })

    // Update all pending orders to CONFIRMED
    const updatedOrders = await prisma.order.updateMany({
      where: {
        userId: session.user.id,
        status: 'PENDING'
      },
      data: {
        status: 'CONFIRMED'
      }
    })

    return NextResponse.json({
      success: true,
      message: `Confirmed ${updatedOrders.count} orders`,
      confirmedOrderIds: pendingOrders.map(order => order.id)
    })

  } catch (error) {
    console.error('Error confirming orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}