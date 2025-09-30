'use client'

import { useSearchParams } from 'next/navigation'
import { XCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Suspense } from 'react'

function CancelContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <XCircleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Cancelled
            </h1>
            <p className="text-gray-600 mb-8">
              Your payment was cancelled. Your order is still saved and you can complete the payment later.
            </p>

            <div className="space-y-4">
              {orderId && (
                <p className="text-sm text-gray-500">
                  Order ID: {orderId}
                </p>
              )}

              <div className="space-x-4">
                {orderId && (
                  <Link
                    href={`/profile/orders`}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Complete Payment
                  </Link>
                )}
                <Link
                  href="/"
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Back to Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutCancel() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CancelContent />
    </Suspense>
  )
}