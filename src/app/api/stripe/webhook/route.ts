import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, processPaymentCompleted, getCheckoutSession } from '@/lib/stripe'
import { generateTicketWithQR } from '@/lib/qr-generator'
import { sendTicketEmail } from '@/lib/email-service'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(payload, signature)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id)
        break

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing completed checkout:', session.id)

    // Get full session details
    const fullSession = await getCheckoutSession(session.id)
    
    // Process payment data
    const paymentData = await processPaymentCompleted(fullSession)
    
    // Generate tickets with QR codes
    const tickets = []
    
    for (const ticketInfo of paymentData.tickets) {
      for (let i = 0; i < ticketInfo.quantity; i++) {
        const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substring(2)}`
        
        const ticketData = {
          ticketId,
          eventId: paymentData.eventId,
          eventTitle: paymentData.eventTitle,
          userId: paymentData.customerEmail,
          userEmail: paymentData.customerEmail,
          tierName: ticketInfo.tierName,
          seatNumber: `${ticketInfo.tierName}-${i + 1}`,
          purchaseDate: new Date().toISOString(),
          eventDate: paymentData.eventDate,
          eventTime: paymentData.eventTime,
          venue: paymentData.venue,
          price: ticketInfo.price
        }

        const { signedData, qrCodeImage } = await generateTicketWithQR(ticketData)
        
        tickets.push({
          ticketId: signedData.ticketId,
          tierName: signedData.tierName || ticketInfo.tierName,
          seatNumber: signedData.seatNumber || `${ticketInfo.tierName}-${i + 1}`,
          price: signedData.price,
          qrCodeImage
        })
      }
    }

    // Send email with tickets
    console.log('Sending ticket email to:', paymentData.customerEmail)
    
    try {
      await sendTicketEmail({
        customerEmail: paymentData.customerEmail,
        customerName: paymentData.customerName,
        eventTitle: paymentData.eventTitle,
        eventDate: paymentData.eventDate,
        eventTime: paymentData.eventTime,
        venue: paymentData.venue,
        tickets,
        totalAmount: paymentData.amountTotal,
        currency: paymentData.currency
      })
      console.log('Ticket email sent successfully!')
    } catch (emailError) {
      console.error('Failed to send ticket email:', emailError)
      // Don't throw error here - we don't want to fail the entire webhook
    }

    console.log(`Successfully processed ${tickets.length} tickets for ${paymentData.customerEmail}`)

  } catch (error) {
    console.error('Error handling checkout completion:', error)
    // In production, you might want to retry failed processing
  }
}