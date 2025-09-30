'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { toast } from 'react-hot-toast'
import { CreditCardIcon, SmartphoneIcon, GlobeIcon } from 'lucide-react'

declare global {
  interface Window {
    ApplePaySession?: any
    google?: any
  }
  var ApplePaySession: any
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Order {
  id: string
  orderNumber: string
  total: string
  status: string
  event: {
    id: string
    title: string
    venue: string
    date: string
  }
  tickets: {
    id: string
    ticketNumber: string
    category: {
      name: string
      price: string
    }
  }[]
}

interface CheckoutProps {
  orderId: string
}

export default function CheckoutPage({ orderId }: CheckoutProps) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>('')

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        toast.error('Order not found')
        router.push('/')
      }
    } catch (error) {
      toast.error('Failed to load order')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleStripePayment = async () => {
    if (!order) return

    setPaymentLoading(true)

    try {
      const response = await fetch('/api/payment/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: Math.round(parseFloat(order.total) * 100), // Convert to cents
          currency: 'usd'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        // Handle Stripe not configured (development mode)
        if (response.status === 503 && error.development) {
          toast.error('💳 Payment system not configured. This is a development environment.')
          console.log('✅ Development mode: Simulating successful payment')
          // Simulate successful payment in development
          toast.success('✅ Development mode: Payment simulated successfully!')
          router.push(`/orders/${order.id}/confirmation`)
          return
        }
        throw new Error(error.error || 'Payment setup failed')
      }

      const { clientSecret } = await response.json()
      const stripe = await stripePromise

      if (!stripe || !clientSecret) {
        throw new Error('Stripe initialization failed')
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: clientSecret
      })

      if (error) {
        throw error
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.')
      console.error('Stripe payment error:', error)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleApplePayPayment = async () => {
    if (!window.ApplePaySession || !ApplePaySession.canMakePayments()) {
      toast.error('Apple Pay is not available on this device')
      return
    }

    setPaymentLoading(true)

    try {
      const session = new ApplePaySession(3, {
        countryCode: 'US',
        currencyCode: 'USD',
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: `Ticket for ${order?.event.title}`,
          amount: order?.total || '0',
          type: 'final'
        }
      })

      interface ApplePayValidateEvent {
        validationURL: string
      }

      interface MerchantSession {
        /* Add properties according to your backend's response shape */
        [key: string]: any
      }

      session.onvalidatemerchant = async (event: ApplePayValidateEvent) => {
        // Validate merchant with your backend
        const response: Response = await fetch('/api/payment/apple-pay/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            validationURL: event.validationURL,
            displayName: 'Concert Tickets'
          })
        })
        const merchantSession: MerchantSession = await response.json()
        session.completeMerchantValidation(merchantSession)
      }

      interface ApplePayPaymentAuthorizedEvent {
        payment: ApplePayPayment;
      }

      interface ApplePayPayment {
        token: any;
        billingContact?: any;
        shippingContact?: any;
        shippingMethod?: any;
        [key: string]: any;
      }

      session.onpaymentauthorized = async (event: ApplePayPaymentAuthorizedEvent) => {
        const payment: ApplePayPayment = event.payment

        const response: Response = await fetch('/api/payment/apple-pay/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order?.id,
            payment: payment
          })
        })

        if (response.ok) {
          session.completePayment(ApplePaySession.STATUS_SUCCESS)
          toast.success('Payment successful!')
          router.push(`/orders/${order?.id}/confirmation`)
        } else {
          session.completePayment(ApplePaySession.STATUS_FAILURE)
          toast.error('Payment failed')
        }
      }

      session.begin()
    } catch (error) {
      toast.error('Apple Pay payment failed')
      console.error('Apple Pay error:', error)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleGooglePayPayment = async () => {
    if (!window.google) {
      toast.error('Google Pay is not available')
      return
    }

    setPaymentLoading(true)

    try {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST'
      })

      const paymentRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'stripe',
              gatewayMerchantId: process.env.NEXT_PUBLIC_STRIPE_MERCHANT_ID
            }
          }
        }],
        merchantInfo: {
          merchantId: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID,
          merchantName: 'Concert Tickets'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: order?.total || '0',
          currencyCode: 'USD'
        }
      }

      const paymentData = await paymentsClient.loadPaymentData(paymentRequest)

      // Process payment with your backend
      const response = await fetch('/api/payment/google-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order?.id,
          paymentToken: paymentData.paymentMethodData.tokenizationData.token
        })
      })

      if (response.ok) {
        toast.success('Payment successful!')
        router.push(`/orders/${order?.id}/confirmation`)
      } else {
        throw new Error('Payment processing failed')
      }
    } catch (error) {
      toast.error('Google Pay payment failed')
      console.error('Google Pay error:', error)
    } finally {
      setPaymentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Complete Your Purchase</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{order.event.title}</h3>
                  <p className="text-gray-600 text-sm">{order.event.venue}</p>
                  <p className="text-gray-600 text-sm">
                    {new Date(order.event.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Tickets ({order.tickets.length})</p>
                  {order.tickets.map((ticket) => (
                    <div key={ticket.id} className="flex justify-between text-sm mb-1">
                      <span>{ticket.category.name}</span>
                      <span>${ticket.category.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-6">Choose Payment Method</h2>

              <div className="space-y-4">
                {/* Stripe Credit Card */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCardIcon className="h-5 w-5 mr-3" />
                      <span className="font-medium">Credit or Debit Card</span>
                    </div>
                    <button
                      onClick={handleStripePayment}
                      disabled={paymentLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {paymentLoading ? 'Processing...' : 'Pay with Card'}
                    </button>
                  </div>
                </div>

                {/* PayPal */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <GlobeIcon className="h-5 w-5 mr-3" />
                      <span className="font-medium">PayPal</span>
                    </div>
                  </div>

                  <PayPalScriptProvider
                    options={{
                      "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                      currency: "USD"
                    }}
                  >
                    <PayPalButtons
                      createOrder={async () => {
                        const response = await fetch('/api/payment/paypal', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            orderId: order.id,
                            amount: order.total
                          })
                        })
                        const data = await response.json()
                        return data.paypalOrderId
                      }}
                      onApprove={async (data) => {
                        const response = await fetch('/api/payment/paypal/capture', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            orderId: order.id,
                            paypalOrderId: data.orderID
                          })
                        })

                        if (response.ok) {
                          toast.success('Payment successful!')
                          router.push(`/orders/${order.id}/confirmation`)
                        } else {
                          toast.error('Payment failed')
                        }
                      }}
                      onError={(err) => {
                        console.error('PayPal error:', err)
                        toast.error('PayPal payment failed')
                      }}
                    />
                  </PayPalScriptProvider>
                </div>

                {/* Apple Pay */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <SmartphoneIcon className="h-5 w-5 mr-3" />
                      <span className="font-medium">Apple Pay</span>
                    </div>
                    <button
                      onClick={handleApplePayPayment}
                      disabled={paymentLoading || typeof window === 'undefined' || !window.ApplePaySession?.canMakePayments()}
                      className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
                    >
                      {paymentLoading ? 'Processing...' : 'Pay with Apple Pay'}
                    </button>
                  </div>
                </div>

                {/* Google Pay */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GlobeIcon className="h-5 w-5 mr-3" />
                      <span className="font-medium">Google Pay</span>
                    </div>
                    <button
                      onClick={handleGooglePayPayment}
                      disabled={paymentLoading}
                      className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                      {paymentLoading ? 'Processing...' : 'Pay with Google Pay'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  🔒 Your payment information is secure and encrypted.
                  All transactions are processed securely through our certified payment providers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}