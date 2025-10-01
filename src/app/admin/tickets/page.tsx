'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Ticket,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Eye,
  ArrowLeft,
  DollarSign
} from 'lucide-react'

interface TicketData {
  id: string
  orderId: string
  eventId: string
  eventTitle: string
  eventDate: string
  userId: string
  userName: string
  userEmail: string
  ticketType: string
  price: number
  status: 'PURCHASED' | 'USED' | 'REFUNDED' | 'CANCELLED'
  qrCode: string
  purchaseDate: string
  usedDate?: string
  refundDate?: string
}

interface TicketStats {
  totalTickets: number
  usedTickets: number
  purchasedTickets: number
  refundedTickets: number
  totalRevenue: number
}

export default function AdminTicketsPage() {
  const { userId, isLoaded } = useAuth()
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [stats, setStats] = useState<TicketStats>({
    totalTickets: 0,
    usedTickets: 0,
    purchasedTickets: 0,
    refundedTickets: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (!userId) {
      redirect('/sign-in')
      return
    }

    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/admin/tickets')
        if (response.status === 403) {
          redirect('/')
          return
        }
        if (response.ok) {
          const data = await response.json()
          setTickets(data.tickets || [])
          setStats(data.stats || {
            totalTickets: 0,
            usedTickets: 0,
            purchasedTickets: 0,
            refundedTickets: 0,
            totalRevenue: 0
          })
        } else {
          setError('Failed to fetch tickets')
        }
      } catch (error) {
        console.error('Error fetching tickets:', error)
        setError('Failed to fetch tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [userId, isLoaded])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PURCHASED': return <Clock className="h-4 w-4" />
      case 'USED': return <CheckCircle className="h-4 w-4" />
      case 'REFUNDED': return <XCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full border"
    switch (status) {
      case 'PURCHASED':
        return `${baseClasses} bg-blue-400 bg-opacity-20 text-blue-300 border-blue-400`
      case 'USED':
        return `${baseClasses} bg-green-400 bg-opacity-20 text-green-300 border-green-400`
      case 'REFUNDED':
        return `${baseClasses} bg-yellow-400 bg-opacity-20 text-yellow-300 border-yellow-400`
      case 'CANCELLED':
        return `${baseClasses} bg-red-400 bg-opacity-20 text-red-300 border-red-400`
      default:
        return `${baseClasses} bg-gray-400 bg-opacity-20 text-gray-300 border-gray-400`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading tickets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 -z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link
                href="/admin"
                className="mr-6 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Ticket
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    {' '}Management
                  </span>
                </h1>
                <p className="text-xl text-gray-200">Monitor and manage all ticket transactions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg">
                <Download className="h-5 w-5 mr-2" />
                Export
              </button>
              <Link
                href="/admin/scan"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Scan Tickets
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-8 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <Ticket className="h-10 w-10 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Tickets</p>
                  <p className="text-3xl font-bold text-white">{stats.totalTickets}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <CheckCircle className="h-10 w-10 text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Used</p>
                  <p className="text-3xl font-bold text-white">{stats.usedTickets}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <Clock className="h-10 w-10 text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Active</p>
                  <p className="text-3xl font-bold text-white">{stats.purchasedTickets}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <XCircle className="h-10 w-10 text-red-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Refunded</p>
                  <p className="text-3xl font-bold text-white">{stats.refundedTickets}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <DollarSign className="h-10 w-10 text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Revenue</p>
                  <p className="text-3xl font-bold text-white">{stats.totalRevenue}€</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by ticket ID, user name, or email..."
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm">
                  <option value="" className="bg-gray-800">All Status</option>
                  <option value="PURCHASED" className="bg-gray-800">Purchased</option>
                  <option value="USED" className="bg-gray-800">Used</option>
                  <option value="REFUNDED" className="bg-gray-800">Refunded</option>
                  <option value="CANCELLED" className="bg-gray-800">Cancelled</option>
                </select>
                <select className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm">
                  <option value="" className="bg-gray-800">All Events</option>
                  <option value="1" className="bg-gray-800">Summer Music Festival</option>
                  <option value="2" className="bg-gray-800">Tech Conference</option>
                  <option value="3" className="bg-gray-800">Jazz Night</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Ticket Info
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Purchase Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Ticket className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {ticket.id}
                              </div>
                              <div className="text-sm text-gray-400">
                                {ticket.ticketType}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{ticket.eventTitle}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(ticket.eventDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{ticket.userName}</div>
                          <div className="text-sm text-gray-400">{ticket.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                          {ticket.price}€
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(ticket.status)}>
                            <span className="flex items-center">
                              {getStatusIcon(ticket.status)}
                              <span className="ml-1">{ticket.status}</span>
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(ticket.purchaseDate).toLocaleDateString()}
                          <div className="text-xs text-gray-400">
                            {new Date(ticket.purchaseDate).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                            title="View QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                          <button
                            className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <Ticket className="h-20 w-20 text-gray-400 mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">No tickets found</h3>
                          <p className="text-gray-300">Tickets will appear here as customers make purchases.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}