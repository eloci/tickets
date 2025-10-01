import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, CreateCheckoutSessionData } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { eventId, eventTitle, eventDate, eventTime, venue, tickets, customerEmail } = body
    
    if (!eventId || !eventTitle || !eventDate || !eventTime || !venue || !tickets || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json(
        { error: 'No tickets specified' },
        { status: 400 }
      )
    }

    // Validate tickets array
    for (const ticket of tickets) {
      if (!ticket.tierId || !ticket.tierName || !ticket.quantity || !ticket.price) {
        return NextResponse.json(
          { error: 'Invalid ticket data' },
          { status: 400 }
        )
      }
      if (ticket.quantity <= 0 || ticket.price <= 0) {
        return NextResponse.json(
          { error: 'Invalid ticket quantity or price' },
          { status: 400 }
        )
      }
    }

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    
    const checkoutData: CreateCheckoutSessionData = {
      eventId,
      eventTitle,
      eventDate,
      eventTime,
      venue,
      tickets,
      customerEmail,
      successUrl: `${origin}/payment/success`,
      cancelUrl: `${origin}/events/${eventId}`
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession(checkoutData)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}