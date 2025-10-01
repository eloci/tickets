import { NextRequest, NextResponse } from 'next/server'
import { generateAppleWalletPass } from '@/lib/wallet-generator'

// This is a simplified version - in production you'd fetch ticket data from database
const mockTicketData = {
  ticketId: 'demo-ticket-123',
  eventTitle: 'Amazing Concert',
  eventDate: '2025-01-15',
  eventTime: '19:00',
  venue: 'Concert Hall',
  tierName: 'VIP',
  seatNumber: 'VIP-001',
  customerName: 'Demo User',
  qrCodeData: JSON.stringify({ ticketId: 'demo-ticket-123', timestamp: Date.now() }),
  price: 89,
  currency: '€'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { ticketId } = params

    // In production, fetch real ticket data from database
    // const ticketData = await getTicketFromDatabase(ticketId)
    
    // For demo, use mock data with the actual ticket ID
    const ticketData = {
      ...mockTicketData,
      ticketId
    }

    // Generate Apple Wallet pass
    const passBuffer = await generateAppleWalletPass(ticketData)

    // Return the pass file
    return new NextResponse(passBuffer as any, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${ticketId}.pkpass"`
      }
    })

  } catch (error) {
    console.error('Error generating Apple Wallet pass:', error)
    return NextResponse.json(
      { error: 'Failed to generate Apple Wallet pass' },
      { status: 500 }
    )
  }
}