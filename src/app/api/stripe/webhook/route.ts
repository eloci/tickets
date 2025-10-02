import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyWebhookSignature, processPaymentCompleted, getCheckoutSession } from '@/lib/stripe'
import { finalizeOrder } from '@/lib/stripe-order'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return new NextResponse(JSON.stringify({ error: 'Missing stripe signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(payload, signature)
    } catch (e) {
      console.error('Invalid Stripe signature:', e)
      return new NextResponse(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      }
      case 'payment_intent.succeeded': {
        console.log('Payment succeeded:', (event.data.object as any)?.id)
        break
      }
      case 'payment_intent.payment_failed': {
        console.log('Payment failed:', (event.data.object as any)?.id)
        break
      }
      default: {
        console.log(`Unhandled event type: ${event.type}`)
      }
    }

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse(JSON.stringify({ error: 'Webhook handler failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing completed checkout:', session.id)

    // Get full session details
    const fullSession = await getCheckoutSession(session.id)
    const paymentData = await processPaymentCompleted(fullSession)
    const result = await finalizeOrder(paymentData)
    console.log(`Successfully processed order ${result.orderId} with ${result.tickets} tickets for ${paymentData.customerEmail}`)

  } catch (error) {
    console.error('Error handling checkout completion:', error)
    // In production, you might want to retry failed processing
  }
}