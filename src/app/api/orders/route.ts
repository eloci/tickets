import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock orders data - replace with MongoDB query
    const orders = [
      {
        id: 'order_1',
        userId: 'user_123',
        eventId: '1',
        eventTitle: 'Summer Music Festival 2025',
        totalAmount: 150,
        status: 'CONFIRMED',
        orderDate: '2025-01-10T10:00:00Z',
        tickets: [
          {
            id: 'ticket_1',
            ticketType: 'General Admission',
            price: 75
          },
          {
            id: 'ticket_2', 
            ticketType: 'General Admission',
            price: 75
          }
        ]
      }
    ]

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock order creation - replace with MongoDB operation
    const newOrder = {
      id: `order_${Date.now()}`,
      userId: body.userId,
      eventId: body.eventId,
      totalAmount: body.totalAmount,
      status: 'PENDING',
      orderDate: new Date().toISOString(),
      tickets: body.tickets || []
    }

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}