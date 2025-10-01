'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

interface Order {
  id: string
  orderNumber?: string
  total: number
  status: string
  event: {
    title: string
    date: string
    venue: string
  }
  tickets: Array<{
    id: string
    ticketNumber: string
    category: {
      name: string
      price: number
    }
  }>
}

interface TicketQR {
  ticketId: string
  ticketNumber: string
  qrCodeImage: string
  eventTitle: string
  categoryName: string
  status: string
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')
  const [order, setOrder] = useState<Order | null>(null)
  const [ticketQRs, setTicketQRs] = useState<TicketQR[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAndConfirmOrder = async () => {
      if (!orderId || !sessionId) {
        setError('Order ID or Session ID not found')
        setLoading(false)
        return
      }

      try {
        // First, confirm the order status since payment was successful
        const confirmResponse = await fetch('/api/mock-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        })

        if (!confirmResponse.ok) {
          console.warn('Could not confirm order, but continuing...')
        }

        // Then fetch the order details
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch order')
        }
        const orderData = await response.json()
        setOrder(orderData)

        // Fetch QR codes for all tickets
        const qrPromises = orderData.tickets.map(async (ticket: any) => {
          try {
            const qrResponse = await fetch(`/api/tickets/${ticket.id}/qr`)
            if (qrResponse.ok) {
              return await qrResponse.json()
            }
            return null
          } catch (error) {
            console.error('Error fetching QR for ticket:', ticket.id, error)
            return null
          }
        })

        const qrResults = await Promise.all(qrPromises)
        const validQRs = qrResults.filter(qr => qr !== null)
        setTicketQRs(validQRs)
      } catch (err) {
        setError('Failed to load order details')
        console.error('Error fetching order:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAndConfirmOrder()
  }, [orderId, sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Your tickets have been confirmed and sent to your email.
            </p>
          </div>

          {order && (
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold text-gray-900">{order.orderNumber || order.id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Event</p>
                  <p className="font-semibold text-gray-900">{order.event.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.event.date).toLocaleDateString()} at {order.event.venue}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Tickets</p>
                  <div className="space-y-2">
                    {order.tickets.map((ticket) => (
                      <div key={ticket.id} className="flex justify-between text-gray-900">
                        <span>{ticket.category.name}</span>
                        <span>{(ticket.category.price || 0).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg text-gray-900">
                    <span>Total</span>
                    <span>{(order.total || 0).toFixed(2)}€</span>
                  </div>
                </div>

                {/* QR Codes Section */}
                {ticketQRs.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Tickets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {ticketQRs.map((ticketQR) => (
                        <div key={ticketQR.ticketId} className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="mb-3">
                            <p className="font-medium text-gray-900">{ticketQR.categoryName}</p>
                            <p className="text-sm text-gray-500">#{ticketQR.ticketNumber}</p>
                          </div>
                          <div className="mb-3">
                            <Image
                              src={ticketQR.qrCodeImage}
                              alt={`QR Code for ticket ${ticketQR.ticketNumber}`}
                              width={200}
                              height={200}
                              className="mx-auto border border-gray-200 rounded"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Scan this QR code at the venue entrance
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-600">
              Your tickets and QR codes have been sent to your email address.
            </p>

            <div className="space-x-4">
              <Link
                href="/profile/orders"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                View My Orders
              </Link>
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
  )
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}