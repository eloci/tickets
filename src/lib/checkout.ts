import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export interface CheckoutData {
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
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(checkoutData: CheckoutData): Promise<void> {
  try {
    const stripe = await stripePromise
    
    if (!stripe) {
      throw new Error('Stripe failed to load')
    }

    // Create checkout session
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create checkout session')
    }

    const { sessionId } = await response.json()

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId
    })

    if (error) {
      throw new Error(error.message || 'Failed to redirect to checkout')
    }

  } catch (error) {
    console.error('Checkout error:', error)
    throw error
  }
}

/**
 * Get checkout session details (for success page)
 */
export async function getCheckoutSessionDetails(sessionId: string) {
  try {
    const response = await fetch(`/api/checkout/session/${sessionId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch session details')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching session details:', error)
    throw error
  }
}