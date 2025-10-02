'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Download, 
  Wallet, 
  ArrowLeft, 
  QrCode, 
  Share2,
  AlertCircle,
  Check,
  X,
  User,
  Ticket as TicketIcon
} from 'lucide-react'
import Header from '@/components/Header'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'

interface TicketData {
  id: string
  ticketNumber: string
  status: 'ACTIVE' | 'USED' | 'CANCELLED'
  qrCode: string
  usedAt?: string
  category: {
    name: string
    price: number
    description?: string
    benefits?: string[]
  }
  order: {
    id: string
    customerName: string
    customerEmail: string
  }
  event: {
    id: string
    title: string
    description: string
    date: string
    venue: string
    address: string
    image?: string
    organizer: string
  }
}

export default function TicketPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)

  const ticketId = params.id as string

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    fetchTicket()
  }, [ticketId, user, isLoaded])

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tickets/${ticketId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Ticket not found')
        } else if (response.status === 403) {
          setError('You do not have permission to view this ticket')
        } else {
          setError('Failed to load ticket details')
        }
        return
      }

      const ticketData = await response.json()
      setTicket(ticketData)
    } catch (error) {
      console.error('Error fetching ticket:', error)
      setError('Failed to load ticket details')
    } finally {
      setLoading(false)
    }
  }

  const downloadWalletPass = async (type: 'apple' | 'google') => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/wallet/${type}`)
      if (!response.ok) throw new Error(`Failed to download ${type} wallet pass`)
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ticket-${ticketId}.${type === 'apple' ? 'pkpass' : 'json'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading wallet pass:', error)
      alert(`Failed to download ${type} wallet pass`)
    }
  }

  const shareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket for ${ticket?.event.title}`,
          text: `Check out my ticket for ${ticket?.event.title}!`,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Ticket URL copied to clipboard!')
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Check className="h-5 w-5 text-green-600" />
      case 'USED':
        return <X className="h-5 w-5 text-gray-600" />
      case 'CANCELLED':
        return <X className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50 border-green-200'
      case 'USED': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center text-white">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <h1 className="text-2xl font-bold mb-4">{error || 'Ticket Not Found'}</h1>
            <p className="text-gray-300 mb-8">The ticket you're looking for doesn't exist or you don't have access to it.</p>
            <Link
              href="/profile/orders"
              className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg hover:bg-white/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <Link
            href="/profile/orders"
            className="inline-flex items-center text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ticket Display */}
            <div className="lg:col-span-2">
              {/* Digital Ticket */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
                {/* Ticket Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(ticket.status)}
                      <span className="text-white font-semibold">
                        {ticket.status === 'ACTIVE' ? 'Valid Ticket' : 
                         ticket.status === 'USED' ? 'Used Ticket' : 'Cancelled Ticket'}
                      </span>
                    </div>
                    <span className="text-white/80 text-sm">#{ticket.ticketNumber}</span>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-6">
                  {ticket.event.image && (
                    <img
                      src={ticket.event.image}
                      alt={ticket.event.title}
                      className="w-full h-48 object-cover rounded-lg mb-6"
                    />
                  )}
                  
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.event.title}</h1>
                  <p className="text-gray-600 mb-4">{ticket.event.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-3" />
                      <div>
                        <p className="font-medium">Date & Time</p>
                        <p className="text-sm">{formatDate(ticket.event.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-3" />
                      <div>
                        <p className="font-medium">Venue</p>
                        <p className="text-sm">{ticket.event.venue}</p>
                        <p className="text-xs text-gray-500">{ticket.event.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Category */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{ticket.category.name}</h3>
                      <span className="text-xl font-bold text-gray-900">${ticket.category.price.toFixed(2)}</span>
                    </div>
                    
                    {ticket.category.description && (
                      <p className="text-sm text-gray-600 mb-2">{ticket.category.description}</p>
                    )}
                    
                    {ticket.category.benefits && ticket.category.benefits.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Includes:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {ticket.category.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center">
                              <Check className="h-3 w-3 text-green-500 mr-2" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* QR Code Section */}
                  {ticket.status === 'ACTIVE' && (
                    <div className="text-center">
                      <div className="bg-gray-50 rounded-lg p-6 mb-4">
                        {showQR ? (
                          <div>
                            <QRCodeDisplay 
                              ticketId={ticket.id}
                              categoryName={ticket.category.name}
                              ticketNumber={ticket.ticketNumber}
                              price={ticket.category.price}
                            />
                            <p className="text-sm text-gray-600 mt-4">
                              Show this QR code at the venue entrance
                            </p>
                            <button
                              onClick={() => setShowQR(false)}
                              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Hide QR Code
                            </button>
                          </div>
                        ) : (
                          <div>
                            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">Your entry QR code</p>
                            <button
                              onClick={() => setShowQR(true)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Show QR Code
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {ticket.status === 'USED' && ticket.usedAt && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Ticket used on {formatDate(ticket.usedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Ticket Status</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                  {getStatusIcon(ticket.status)}
                  <span className="ml-2">{ticket.status}</span>
                </div>
              </div>

              {/* Actions */}
              {ticket.status === 'ACTIVE' && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => downloadWalletPass('apple')}
                      className="w-full flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Add to Apple Wallet
                    </button>
                    
                    <button
                      onClick={() => downloadWalletPass('google')}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Add to Google Pay
                    </button>
                    
                    <button
                      onClick={shareTicket}
                      className="w-full flex items-center justify-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Ticket
                    </button>
                  </div>
                </div>
              )}

              {/* Order Info */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Order ID:</span>
                    <span className="text-white font-mono">#{ticket.order.id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Customer:</span>
                    <span className="text-white">{ticket.order.customerName}</span>
                  </div>
                </div>
                
                <Link
                  href={`/orders/${ticket.order.id}`}
                  className="inline-flex items-center mt-4 text-blue-300 hover:text-blue-200"
                >
                  View Full Order
                  <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                </Link>
              </div>

              {/* Event Info */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Event Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Organizer:</span>
                    <span className="text-white">{ticket.event.organizer}</span>
                  </div>
                </div>
                
                <Link
                  href={`/events/${ticket.event.id}`}
                  className="inline-flex items-center mt-4 text-blue-300 hover:text-blue-200"
                >
                  Event Details
                  <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}