'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  Eye,
  Download,
  Smartphone,
  Search,
  ExternalLink,
  QrCode,
  Mail
} from 'lucide-react'

interface Order {
  id: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venue: string
  totalAmount: number
  currency: string
  status: 'confirmed' | 'pending' | 'cancelled'
  ticketsCount: number
  purchaseDate: string
  eventImage?: string
  tickets: OrderTicket[]
}

interface OrderTicket {
  id: string
  type: string
  seat?: string
  price: number
  qrCode: string
  used: boolean
  usedAt?: string
}

export default function OrdersPage() {
  const { user, isLoaded } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [expandedTicketIds, setExpandedTicketIds] = useState<Record<string, boolean>>({})

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch real data from API
  useEffect(() => {
    if (isLoaded && user) {  // Restore user requirement for real data
      const fetchOrders = async () => {
        try {
          const params = new URLSearchParams()
          if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)
          if (filterStatus !== 'all') params.append('status', filterStatus)

          const response = await fetch(`/api/orders?${params.toString()}`)
          if (response.ok) {
            const data = await response.json()
            // Ensure data is always an array
            setOrders(Array.isArray(data) ? data : [])
          } else {
            console.error('Failed to fetch orders')
            setOrders([])
          }
        } catch (error) {
          console.error('Error fetching orders:', error)
          setOrders([])
        } finally {
          setLoading(false)
        }
      }

      fetchOrders()
    } else if (isLoaded) {
      // If loaded but no user, stop loading
      setLoading(false)
    }
  }, [isLoaded, user, debouncedSearchTerm, filterStatus])  // Restore user dependency

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-white text-xl">Loading your orders...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-white text-xl">Please sign in to view your orders</div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleResendTickets = async (orderId: string) => {
    try {
      const response = await fetch('/api/send-ticket-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.emailAddresses?.[0]?.emailAddress,
          orderId: orderId
        }),
      })

      if (response.ok) {
        alert('Tickets resent successfully!')
      } else {
        alert('Failed to resend tickets. Please try again.')
      }
    } catch (error) {
      console.error('Error resending tickets:', error)
      alert('Error resending tickets. Please try again.')
    }
  }

  const toggleTicket = (ticketId: string) => {
    setExpandedTicketIds(prev => ({ ...prev, [ticketId]: !prev[ticketId] }))
  }

  const handleDownloadQR = (ticket: OrderTicket) => {
    try {
      if (!ticket.qrCode) return
      const link = document.createElement('a')
      link.href = ticket.qrCode
      link.download = `${ticket.id}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (e) {
      console.error('Failed to download QR:', e)
      alert('Could not download QR image.')
    }
  }

  const handleDownloadDetails = (order: Order, ticket: OrderTicket) => {
    try {
      const details = {
        ticket: {
          id: ticket.id,
          type: ticket.type,
          seat: ticket.seat,
          price: ticket.price,
          used: ticket.used,
          usedAt: ticket.usedAt || null,
        },
        order: {
          id: order.id,
          purchaseDate: order.purchaseDate,
          status: order.status,
          currency: order.currency,
          totalAmount: order.totalAmount,
        },
        event: {
          title: order.eventTitle,
          date: order.eventDate,
          time: order.eventTime,
          venue: order.venue,
          image: order.eventImage || null,
        }
      }
      const blob = new Blob([JSON.stringify(details, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${ticket.id}-details.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Failed to download details:', e)
      alert('Could not download ticket details.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/profile" className="text-white/70 hover:text-white mr-4">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-white">My Orders</h1>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="text-white/70 text-sm">
              {orders.length} order{orders.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 text-center">
              <Ticket className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
              <p className="text-white/70 mb-6">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You haven\'t made any ticket purchases yet.'
                }
              </p>
              <Link
                href="/events"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Browse Events
              </Link>
            </div>
          ) : (
            (orders || []).map((order: any) => (
              <div key={order.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-6 lg:space-y-0">
                  {/* Order Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    {order.eventImage && (
                      <img
                        src={order.eventImage}
                        alt={order.eventTitle}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{order.eventTitle}</h3>
                          <div className="flex flex-wrap items-center text-white/70 text-sm space-x-4 mb-2">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(order.eventDate).toLocaleDateString()} at {order.eventTime}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {order.venue}
                            </span>
                            <span className="flex items-center">
                              <Ticket className="h-4 w-4 mr-1" />
                              {order.ticketsCount} ticket{order.ticketsCount > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white mb-1">
                            {order.currency} ${order.totalAmount.toFixed(2)}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="text-white/50 text-xs mb-4">
                        Order #{order.id} • Purchased on {new Date(order.purchaseDate).toLocaleDateString()}
                      </div>

                      {/* Tickets */}
                      <div className="bg-white/5 rounded-xl p-4 mb-4">
                        <h4 className="text-white font-medium mb-3">Tickets</h4>
                        <div className="space-y-2">
                          {order.tickets.map((ticket: any) => (
                            <div key={ticket.id} className="p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <QrCode className="h-5 w-5 text-white/70" />
                                  <div>
                                    <span className="text-white font-medium">{ticket.type}</span>
                                    {ticket.seat && <span className="text-white/70 ml-2">• {ticket.seat}</span>}
                                    <div className="text-white/50 text-xs">#{ticket.id}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right mr-2">
                                    <div className="text-white font-medium">${ticket.price.toFixed(2)}</div>
                                    {ticket.used ? (
                                      <div className="text-green-400 text-xs">
                                        Used {ticket.usedAt && new Date(ticket.usedAt).toLocaleDateString()}
                                      </div>
                                    ) : (
                                      <div className="text-blue-400 text-xs">Valid</div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => toggleTicket(ticket.id)}
                                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md text-xs"
                                  >
                                    {expandedTicketIds[ticket.id] ? 'Hide QR' : 'Show QR'}
                                  </button>
                                  <button
                                    onClick={() => handleDownloadQR(ticket)}
                                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md text-xs"
                                  >
                                    Download QR
                                  </button>
                                  <button
                                    onClick={() => handleDownloadDetails(order, ticket)}
                                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md text-xs"
                                  >
                                    Download Details
                                  </button>
                                </div>
                              </div>
                              {expandedTicketIds[ticket.id] && ticket.qrCode && (
                                <div className="mt-3 p-3 bg-white/5 rounded-md border border-white/10">
                                  <div className="text-white/70 text-xs mb-2">Scan this QR at the venue entrance</div>
                                  <img src={ticket.qrCode} alt={`QR for ${ticket.id}`} className="w-40 h-40 object-contain bg-white rounded" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/orders/${order.id}/confirmation`}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                        <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Add to Wallet
                        </button>
                        <button
                          onClick={() => handleResendTickets(order.id)}
                          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Resend Email
                        </button>
                        {new Date(order.eventDate) > new Date() && (
                          <Link
                            href={`/events/${order.eventTitle.toLowerCase().replace(/\s+/g, '-')}`}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Event Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {orders.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {orders.reduce((acc: number, order: any) => acc + order.ticketsCount, 0)}
                </div>
                <div className="text-white/70 text-sm">Total Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  ${orders.reduce((acc: number, order: any) => acc + order.totalAmount, 0).toFixed(2)}
                </div>
                <div className="text-white/70 text-sm">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {orders.filter((order: any) => new Date(order.eventDate) > new Date()).length}
                </div>
                <div className="text-white/70 text-sm">Upcoming Events</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}