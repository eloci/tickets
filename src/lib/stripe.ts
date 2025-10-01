import Stripe from 'stripe'

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export interface CreateCheckoutSessionData {
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venue: string
  tickets: Array<{
    tierId: string
    tierName: string
    quantity: number
    price: number
  }>
  customerEmail: string
  successUrl: string
  cancelUrl: string
}

export interface TicketLineItem {
  price_data: {
    currency: string
    product_data: {
      name: string
      description: string
      metadata: {
        eventId: string
        tierId: string
        eventTitle: string
        eventDate: string
        eventTime: string
        venue: string
      }
    }
    unit_amount: number
  }
  quantity: number
}

/**
 * Create Stripe checkout session for ticket purchase
 */
export async function createCheckoutSession(data: CreateCheckoutSessionData): Promise<Stripe.Checkout.Session> {
  try {
    // Convert tickets to Stripe line items
    const lineItems: TicketLineItem[] = data.tickets.map(ticket => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${data.eventTitle} - ${ticket.tierName}`,
          description: `Event: ${data.eventTitle} | Date: ${data.eventDate} ${data.eventTime} | Venue: ${data.venue}`,
          metadata: {
            eventId: data.eventId,
            tierId: ticket.tierId,
            eventTitle: data.eventTitle,
            eventDate: data.eventDate,
            eventTime: data.eventTime,
            venue: data.venue
          }
        },
        unit_amount: Math.round(ticket.price * 100) // Convert to cents
      },
      quantity: ticket.quantity
    }))

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${data.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: data.cancelUrl,
      customer_email: data.customerEmail,
      metadata: {
        eventId: data.eventId,
        eventTitle: data.eventTitle,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        venue: data.venue,
        ticketData: JSON.stringify(data.tickets)
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true
      },
      automatic_tax: {
        enabled: false
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
    })

    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}

/**
 * Retrieve checkout session details
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent']
    })
    return session
  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    throw new Error('Failed to retrieve checkout session')
  }
}

/**
 * Verify webhook signature (for payment confirmation)
 */
export function verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw new Error('Invalid webhook signature')
  }
}

/**
 * Handle successful payment completion
 */
export interface PaymentCompletedData {
  sessionId: string
  paymentIntentId: string
  customerEmail: string
  customerName: string
  customerPhone?: string
  billingAddress: Stripe.Address
  amountTotal: number
  currency: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venue: string
  tickets: Array<{
    tierId: string
    tierName: string
    quantity: number
    price: number
  }>
}

export async function processPaymentCompleted(session: Stripe.Checkout.Session): Promise<PaymentCompletedData> {
  const tickets = JSON.parse(session.metadata?.ticketData || '[]')
  
  return {
    sessionId: session.id,
    paymentIntentId: session.payment_intent as string,
    customerEmail: session.customer_email!,
    customerName: session.customer_details?.name || 'Unknown',
    customerPhone: session.customer_details?.phone || undefined,
    billingAddress: session.customer_details?.address!,
    amountTotal: session.amount_total! / 100, // Convert from cents
    currency: session.currency!,
    eventId: session.metadata?.eventId!,
    eventTitle: session.metadata?.eventTitle!,
    eventDate: session.metadata?.eventDate!,
    eventTime: session.metadata?.eventTime!,
    venue: session.metadata?.venue!,
    tickets
  }
}

export default stripe