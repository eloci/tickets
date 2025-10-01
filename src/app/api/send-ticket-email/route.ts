import { NextRequest, NextResponse } from 'next/server'
import { sendTicketEmail } from '@/lib/email-service'
import { generateTicketWithQR } from '@/lib/qr-generator'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, customerEmail, customerName } = await request.json()

    if (!sessionId || !customerEmail) {
      return NextResponse.json(
        { error: 'Session ID and customer email are required' },
        { status: 400 }
      )
    }

    console.log('Manually sending ticket email for session:', sessionId)

    // For demo/testing purposes, create mock ticket data
    const mockEventData = {
      eventTitle: 'Demo Concert Event',
      eventDate: '2025-10-15',
      eventTime: '20:00',
      venue: 'Demo Arena',
      totalAmount: 89.00,
      currency: 'USD'
    }

    // Generate a demo ticket with QR code
    const ticketData = {
      ticketId: `demo_${Date.now()}`,
      eventId: 'demo_event',
      eventTitle: mockEventData.eventTitle,
      userId: customerEmail,
      userEmail: customerEmail,
      tierName: 'General Admission',
      seatNumber: 'GA-001',
      purchaseDate: new Date().toISOString(),
      eventDate: mockEventData.eventDate,
      eventTime: mockEventData.eventTime,
      venue: mockEventData.venue,
      price: mockEventData.totalAmount
    }

    console.log('Generating QR code for ticket:', ticketData.ticketId)
    const { signedData, qrCodeImage } = await generateTicketWithQR(ticketData)

    const emailData = {
      customerEmail,
      customerName: customerName || 'Customer',
      eventTitle: mockEventData.eventTitle,
      eventDate: mockEventData.eventDate,
      eventTime: mockEventData.eventTime,
      venue: mockEventData.venue,
      tickets: [{
        ticketId: signedData.ticketId,
        tierName: signedData.tierName || 'General Admission',
        seatNumber: signedData.seatNumber || 'GA-001',
        price: signedData.price,
        qrCodeImage
      }],
      totalAmount: mockEventData.totalAmount,
      currency: mockEventData.currency
    }

    console.log('Sending ticket email to:', customerEmail)
    await sendTicketEmail(emailData)
    console.log('✅ Ticket email sent successfully!')

    return NextResponse.json({
      success: true,
      message: 'Ticket email sent successfully',
      ticketId: signedData.ticketId
    })

  } catch (error) {
    console.error('❌ Error sending manual ticket email:', error)
    return NextResponse.json(
      { 
        error: `Failed to send ticket email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    )
  }
}