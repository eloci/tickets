'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Ticket, Calendar, MapPin, Clock, Plus, Trash2, User, Mail } from 'lucide-react'

interface DemoOrderData {
  eventTitle: string
  eventDate: string
  eventVenue: string
  customerName: string
  customerEmail: string
  tickets: Array<{
    category: string
    price: number
    quantity: number
  }>
}

export default function DemoOrdersPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [orderData, setOrderData] = useState<DemoOrderData>({
    eventTitle: 'Summer Music Festival 2025',
    eventDate: '2025-07-15T19:00:00Z',
    eventVenue: 'Central Park Amphitheater',
    customerName: user?.fullName || 'John Doe',
    customerEmail: user?.primaryEmailAddress?.emailAddress || 'john.doe@example.com',
    tickets: [
      { category: 'General Admission', price: 75, quantity: 2 },
      { category: 'VIP', price: 150, quantity: 1 }
    ]
  })

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin'

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You need admin privileges to access this page.</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const updateTicket = (index: number, field: string, value: any) => {
    const newTickets = [...orderData.tickets]
    newTickets[index] = { ...newTickets[index], [field]: value }
    setOrderData({ ...orderData, tickets: newTickets })
  }

  const addTicketCategory = () => {
    setOrderData({
      ...orderData,
      tickets: [...orderData.tickets, { category: 'New Category', price: 50, quantity: 1 }]
    })
  }

  const removeTicketCategory = (index: number) => {
    const newTickets = orderData.tickets.filter((_, i) => i !== index)
    setOrderData({ ...orderData, tickets: newTickets })
  }

  const calculateTotal = () => {
    return orderData.tickets.reduce((total, ticket) => total + (ticket.price * ticket.quantity), 0)
  }

  const createDemoOrder = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/create-sample-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create demo order')
      }

      const result = await response.json()
      setSuccess(`Demo order created successfully! Order ID: ${result.orderId}`)

      // Optionally redirect to the order page
      setTimeout(() => {
        router.push(`/orders/${result.orderId}`)
      }, 2000)

    } catch (error) {
      console.error('Error creating demo order:', error)
      setError(error instanceof Error ? error.message : 'Failed to create demo order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Demo Order Creator</h1>
          <p className="text-gray-600 mt-2">Create sample orders for testing purposes</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Configuration */}
          <div className="space-y-6">
            {/* Event Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Event Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    value={orderData.eventTitle}
                    onChange={(e) => setOrderData({ ...orderData, eventTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <input
                    type="datetime-local"
                    value={orderData.eventDate.slice(0, 16)}
                    onChange={(e) => setOrderData({ ...orderData, eventDate: e.target.value + ':00Z' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={orderData.eventVenue}
                    onChange={(e) => setOrderData({ ...orderData, eventVenue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={orderData.customerName}
                    onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={orderData.customerEmail}
                    onChange={(e) => setOrderData({ ...orderData, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Ticket className="h-5 w-5 mr-2" />
                  Tickets
                </h2>
                <button
                  onClick={addTicketCategory}
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                </button>
              </div>

              <div className="space-y-4">
                {orderData.tickets.map((ticket, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Ticket Category {index + 1}</h3>
                      <button
                        onClick={() => removeTicketCategory(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                          type="text"
                          value={ticket.category}
                          onChange={(e) => updateTicket(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input
                          type="number"
                          value={ticket.price}
                          onChange={(e) => updateTicket(index, 'price', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={ticket.quantity}
                          onChange={(e) => updateTicket(index, 'quantity', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            {/* Order Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Preview</h2>

              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-lg text-gray-900">{orderData.eventTitle}</h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(orderData.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{orderData.eventVenue}</span>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                  <p className="text-gray-600">{orderData.customerName}</p>
                  <p className="text-gray-600">{orderData.customerEmail}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tickets</h4>
                  <div className="space-y-2">
                    {orderData.tickets.map((ticket, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="text-gray-900">{ticket.category}</span>
                          <span className="text-gray-600"> x{ticket.quantity}</span>
                        </div>
                        <span className="font-semibold">${(ticket.price * ticket.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Order Button */}
            <button
              onClick={createDemoOrder}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creating Order...' : 'Create Demo Order'}
            </button>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Demo Order Info</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Creates a sample order with confirmed status</li>
                <li>• Generates QR codes for all tickets</li>
                <li>• Sends confirmation email (if configured)</li>
                <li>• Perfect for testing the complete flow</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}