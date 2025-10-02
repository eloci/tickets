'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw, CreditCard } from 'lucide-react'

function PaymentCancelContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const orderId = searchParams?.get('order_id')
  const sessionId = searchParams?.get('session_id')

  useEffect(() => {
    if (orderId) {
      fetchOrderData()
    } else {
      setLoading(false)
    }
  }, [orderId])

  const fetchOrderData = async () => {
    try {
      if (!orderId) return

      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrderData(data)
      }
    } catch (error) {
      console.error('Error fetching order data:', error)
    } finally {
      setLoading(false)
    }
  }

  const retryPayment = () => {
    if (orderData) {
      router.push(`/checkout?order_id=${orderId}`)
    } else {
      router.push('/events')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-8">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Payment Cancelled
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            Your payment was cancelled and no charges were made to your account.
          </p>

          {/* Order Info */}
          {orderData && (
            <div className="bg-white rounded-lg shadow p-6 mb-8 text-left">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-sm">#{orderData.id.slice(-8)}</span>
                </div>
                {orderData.event && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event:</span>
                    <span className="font-medium">{orderData.event.title}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">${orderData.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Payment Pending
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* What Happened */}
          <div className="bg-white rounded-lg shadow p-6 mb-8 text-left">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What happened?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• You cancelled the payment process</li>
              <li>• Your order is still reserved for a limited time</li>
              <li>• No charges were made to your payment method</li>
              <li>• You can retry the payment or choose a different method</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {orderData && (
              <button
                onClick={retryPayment}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Try Payment Again
              </button>
            )}

            <Link
              href="/events"
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse More Events
            </Link>

            <Link
              href="/contact"
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Need Help? Contact Support
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-xs text-gray-500">
            <p>
              Order reservations expire after 15 minutes.
              {orderData && (
                <span className="block mt-1">
                  Complete your payment soon to secure your tickets.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}