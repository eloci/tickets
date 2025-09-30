'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { CheckCircleIcon, CalendarIcon, MapPinIcon, TicketIcon } from '@heroicons/react/24/outline'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: string
  event: {
    title: string
    venue: string
    address: string
    city: string
    country: string
    date: string
    startTime: string
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

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading order confirmation...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">The order you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your tickets are ready!
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
            {order.status === 'PENDING' && (
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Payment in Development Mode
              </div>
            )}
            {order.status === 'CONFIRMED' && (
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Confirmed
              </div>
            )}
          </div>

          {/* Event Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">{order.event.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date & Time</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(order.event.date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTime(order.event.startTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Venue</p>
                  <p className="text-sm text-gray-600">{order.event.venue}</p>
                  <p className="text-sm text-gray-600">
                    {order.event.address}, {order.event.city}, {order.event.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <TicketIcon className="h-5 w-5 mr-2" />
              Your Tickets
            </h3>
            <div className="space-y-3">
              {order.tickets.map((ticket) => (
                <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{ticket.category.name}</p>
                      <p className="text-sm text-gray-600">Ticket #{ticket.ticketNumber}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${ticket.category.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium text-gray-900">Total</p>
              <p className="text-lg font-bold text-gray-900">${order.total}</p>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        {order.status === 'PENDING' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This order was created in development mode. In production, you would receive email confirmation with QR codes for entry.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Check your email for confirmation and QR codes</li>
            <li>• Save tickets to your mobile wallet (Apple Wallet/Google Pay)</li>
            <li>• Arrive at the venue 30 minutes before the event</li>
            <li>• Present your QR code at the entrance</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/profile/orders"
            className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            View All Orders
          </Link>
          <Link
            href="/"
            className="flex-1 bg-gray-200 text-gray-900 text-center py-3 px-6 rounded-md hover:bg-gray-300 transition-colors"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  )
}