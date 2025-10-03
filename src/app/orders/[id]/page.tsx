'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/use-user'
import { Calendar, MapPin, Clock, Download, ExternalLink, ArrowLeft, QrCode, Wallet } from 'lucide-react'

interface OrderDetails {
  id: string
  customerName: string
  customerEmail: string
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  createdAt: string
  event: {
    id: string
    title: string
    date: string
    venue: string
    image?: string
  }
  tickets: Array<{
    id: string
    ticketNumber: string
    category: {
      name: string
      price: number
    }
    status: 'ACTIVE' | 'USED' | 'CANCELLED'
    qrCode?: string
  }>
}

export default function OrderPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderId = params.id as string

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    fetchOrder()
  }, [orderId, user, isLoaded])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Order not found')
        } else if (response.status === 403) {
          setError('You do not have permission to view this order')
        } else {
          setError('Failed to load order details')
        }
        return
      }

      const orderData = await response.json()
      setOrder(orderData)
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const downloadTicketPDF = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/pdf`)
      if (!response.ok) throw new Error('Failed to download PDF')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tickets-order-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download tickets PDF')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-600 bg-green-50'
      case 'PENDING': return 'text-yellow-600 bg-yellow-50'
      case 'CANCELLED': return 'text-red-600 bg-red-50'
      case 'ACTIVE': return 'text-green-600 bg-green-50'
      case 'USED': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isLoaded || loading) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/profile/orders"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
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
            href="/profile/orders"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile/orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(-8)}</h1>
                <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                <p className="text-gray-600">{order.customerName}</p>
                <p className="text-gray-600">{order.customerEmail}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Order Total</h3>
                <p className="text-2xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Event Details</h2>
          <div className="flex items-start space-x-4">
            {order.event.image && (
              <img
                src={order.event.image}
                alt={order.event.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{order.event.title}</h3>
              <div className="flex items-center text-gray-600 mt-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(order.event.date)}</span>
              </div>
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{order.event.venue}</span>
              </div>
              <Link
                href={`/events/${order.event.id}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-2"
              >
                View Event Details
                <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Tickets</h2>
            {order.status === 'CONFIRMED' && (
              <button
                onClick={downloadTicketPDF}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
            )}
          </div>

          <div className="space-y-4">
            {order.tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{ticket.category.name}</h4>
                    <p className="text-sm text-gray-600">Ticket #{ticket.ticketNumber}</p>
                    <p className="text-lg font-semibold text-gray-900">${ticket.category.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>

                    {ticket.status === 'ACTIVE' && (
                      <div className="flex space-x-2">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          QR Code
                        </Link>
                        <Link
                          href={`/api/tickets/${ticket.id}/wallet/apple`}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          <Wallet className="h-4 w-4 mr-1" />
                          Wallet
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/contact"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50"
            >
              <h3 className="font-medium text-gray-900">Contact Support</h3>
              <p className="text-gray-600 text-sm">Get help with your order or tickets</p>
            </Link>
            <Link
              href={`/events/${order.event.id}`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50"
            >
              <h3 className="font-medium text-gray-900">Event Information</h3>
              <p className="text-gray-600 text-sm">View event details and updates</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}