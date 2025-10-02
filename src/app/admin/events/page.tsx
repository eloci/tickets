'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Users,
  DollarSign,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Star,
  TrendingUp,
  Loader2
} from 'lucide-react'

interface Event {
  id: string
  _id?: string
  title: string
  description: string
  date: string
  time?: string
  venue: string
  address?: string
  city?: string
  imageUrl?: string
  price?: number
  capacity?: number
  soldTickets: number
  status: string
  createdAt: string
  image?: string
  category?: string
  // New fields for ticket calculations from API
  totalCapacity?: number
  totalSold?: number
  remainingSpots?: number
  minPrice?: number
  categoriesCount?: number
  availabilityStatus?: string
  categories?: Array<{
    id: string
    name: string
    price: number
    capacity: number
    sold: number
    remaining: number
  }>
  ticketTiers?: Array<{
    id: string
    name: string
    price: number
    capacity: number
    sold: number
    remaining: number
  }>
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events')

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      // Check if the response has the expected structure and events is an array
      if (data && data.success && Array.isArray(data.events)) {
        setEvents(data.events.map((event: any) => ({
          ...event,
          id: event._id || event.id, // Ensure we always have an id property
          image: event.imageUrl, // Map imageUrl to image
          location: event.city || event.address || 'TBA',
          // Use calculated fields from API
          capacity: event.totalCapacity || 0,
          soldTickets: event.totalSold || 0,
          price: event.minPrice || 0,
          status: event.status || 'DRAFT'
        })))
      } else {
        console.error('❌ Unexpected response format:', data)
        setEvents([]) // Set empty array as fallback
        setError('Invalid data format received from server')
      }
    } catch (err) {
      console.error('❌ Error fetching events:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (eventId: string) => {
    try {
      setDeletingId(eventId)
      setError(null)

      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      })

      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        // Not JSON, get text content for better error handling
        const textContent = await response.text()
        console.error('Non-JSON response:', textContent)
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete event')
      }

      // Remove the event from local state
      setEvents(events.filter(event => event.id !== eventId))

      // Show success message
      console.log('✅ Event deleted successfully')

    } catch (err) {
      console.error('❌ Error deleting event:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete event')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteEvent = async (event: Event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      await deleteEvent(event.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading events...</p>
        </div>
      </div>
    )
  }

  const totalEvents = events.length
  const publishedEvents = events.filter(e => e.status === 'PUBLISHED').length
  const draftEvents = events.filter(e => e.status === 'DRAFT').length
  const totalRevenue = events.reduce((sum, event) => sum + (event.soldTickets * (event.price || 0)), 0)

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'PUBLISHED':
        return `${baseClasses} bg-green-400 bg-opacity-20 text-green-300 border border-green-400`
      case 'DRAFT':
        return `${baseClasses} bg-yellow-400 bg-opacity-20 text-yellow-300 border border-yellow-400`
      case 'CANCELLED':
        return `${baseClasses} bg-red-400 bg-opacity-20 text-red-300 border border-red-400`
      default:
        return `${baseClasses} bg-gray-400 bg-opacity-20 text-gray-300 border border-gray-400`
    }
  }

  // Helper function to get availability ribbon based on ticket data
  const getAvailabilityRibbon = (event: Event) => {
    const remainingSpots = event.remainingSpots || (event.capacity || 0) - (event.soldTickets || 0)
    const totalCapacity = event.capacity || 0

    if (totalCapacity === 0) {
      return { color: 'bg-gray-500', text: 'NO TICKETS' }
    }

    if (remainingSpots === 0) {
      return { color: 'bg-red-500', text: 'SOLD OUT' }
    } else if (totalCapacity > 0 && (remainingSpots / totalCapacity) <= 0.1) {
      return { color: 'bg-orange-500', text: `${remainingSpots} LEFT` }
    } else if (totalCapacity > 0 && (remainingSpots / totalCapacity) <= 0.25) {
      return { color: 'bg-yellow-500', text: `${remainingSpots} LEFT` }
    } else {
      return { color: 'bg-green-500', text: `${remainingSpots} AVAILABLE` }
    }
  }

  // Helper function to get tickets sold percentage
  const getTicketsSoldPercentage = (event: Event): number => {
    const totalCapacity = event.capacity || 0
    const soldTickets = event.soldTickets || 0
    return totalCapacity > 0 ? Math.round((soldTickets / totalCapacity) * 100) : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Error Alert */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/90 backdrop-blur-md border border-red-400 rounded-lg p-4 text-white shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm text-red-100">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-200 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
                  Events
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    {' '}Management
                  </span>
                </h1>
                <p className="text-xl text-gray-200">Create and manage your amazing events</p>
              </div>
            </div>
            <Link
              href="/admin/events/create"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Event
            </Link>
          </div>
        </div>
      </div>

      <div className="relative -mt-8 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <Calendar className="h-10 w-10 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Events</p>
                  <p className="text-3xl font-bold text-white">{totalEvents}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                    <span className="text-xs text-green-400">+2 this month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <Eye className="h-10 w-10 text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Published</p>
                  <p className="text-3xl font-bold text-white">{publishedEvents}</p>
                  <p className="text-xs text-gray-400">{Math.round((publishedEvents / totalEvents) * 100)}% of total</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <Edit className="h-10 w-10 text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Drafts</p>
                  <p className="text-3xl font-bold text-white">{draftEvents}</p>
                  <p className="text-xs text-gray-400">Need attention</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <DollarSign className="h-10 w-10 text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">{totalRevenue.toLocaleString()}€</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                    <span className="text-xs text-green-400">+12% this month</span>
                  </div>
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
                    placeholder="Search events by title, venue, or location..."
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm">
                  <option value="" className="bg-gray-800">All Status</option>
                  <option value="PUBLISHED" className="bg-gray-800">Published</option>
                  <option value="DRAFT" className="bg-gray-800">Draft</option>
                  <option value="CANCELLED" className="bg-gray-800">Cancelled</option>
                </select>
                <select className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm">
                  <option value="" className="bg-gray-800">All Dates</option>
                  <option value="upcoming" className="bg-gray-800">Upcoming</option>
                  <option value="past" className="bg-gray-800">Past</option>
                  <option value="today" className="bg-gray-800">Today</option>
                </select>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const availabilityRibbon = getAvailabilityRibbon(event)
              const ticketsSoldPercentage = getTicketsSoldPercentage(event)

              return (
                <div key={event._id || event.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                  {/* Availability Ribbon */}
                  <div className={`absolute top-4 right-4 z-10 ${availabilityRibbon.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-12`}>
                    {availabilityRibbon.text}
                  </div>

                  <div className="relative h-48 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 overflow-hidden">
                    {(event.image || event.imageUrl) ? (
                      <img
                        src={event.image || event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600"></div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute top-4 left-4">
                      <span className={getStatusBadge(event.status)}>
                        {event.status}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{event.title}</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-300 mb-4 line-clamp-2">{event.description}</p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="h-4 w-4 mr-3 text-blue-400" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center text-gray-300">
                        <Users className="h-4 w-4 mr-3 text-green-400" />
                        <span>{event.venue}{event.address ? ', ' + event.address : ''}{event.city ? ', ' + event.city : ''}</span>
                      </div>

                      <div className="flex items-center text-gray-300">
                        <DollarSign className="h-4 w-4 mr-3 text-purple-400" />
                        <span>
                          {event.ticketTiers && event.ticketTiers.length > 0
                            ? 'From ' + Math.min(...event.ticketTiers.map((tier: any) => tier.price)) + '€'
                            : event.minPrice
                              ? 'From ' + event.minPrice + '€'
                              : (event.price ? event.price + '€' : 'Price TBD')
                          }
                          • {event.totalSold || 0}/{event.totalCapacity || 0} sold
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-300 mb-2">
                        <span>Tickets sold</span>
                        <span>{ticketsSoldPercentage}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${ticketsSoldPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/events/${event._id || event.id}/edit`}
                          className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                          title="Edit Event"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/events/${event._id || event.id}`}
                          className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                          title="View Event"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Event"
                          onClick={() => handleDeleteEvent(event)}
                          disabled={deletingId === (event._id || event.id)}
                        >
                          {deletingId === (event._id || event.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-400">
                          Revenue: <span className="text-white font-medium">
                            {event.ticketTiers && event.ticketTiers.length > 0
                              ? 'Multi-tier' // Revenue calculation would need order data for multi-tier events
                              : event.price && event.totalSold
                                ? (event.totalSold * event.price).toLocaleString() + '€'
                                : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {events.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 max-w-md mx-auto">
                <Calendar className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-3">No events found</h3>
                <p className="text-gray-300 mb-6">Get started by creating your first amazing event!</p>
                <Link
                  href="/admin/events/create"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 inline-flex items-center shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Event
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}