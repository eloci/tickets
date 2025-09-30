import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock tickets data - replace with MongoDB query
    const tickets = [
      {
        id: 'ticket_1',
        eventId: '1',
        eventTitle: 'Summer Music Festival 2025',
        userId: 'user_123',
        status: 'PURCHASED',
        ticketType: 'General Admission',
        price: 75,
        purchaseDate: '2025-01-10T10:00:00Z',
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ticket_1'
      }
    ]

    return NextResponse.json(tickets)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock ticket creation - replace with MongoDB operation
    const newTicket = {
      id: `ticket_${Date.now()}`,
      eventId: body.eventId,
      userId: body.userId,
      status: 'PURCHASED',
      ticketType: body.ticketType,
      price: body.price,
      purchaseDate: new Date().toISOString(),
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ticket_${Date.now()}`
    }

    return NextResponse.json(newTicket, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}