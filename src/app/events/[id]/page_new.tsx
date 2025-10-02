'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import {
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Ticket,
  Share2,
  Heart,
  Star,
  User,
  Calendar as CalendarIcon,
  Plus,
  Minus,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Play
} from 'lucide-react'
import Header from '@/components/Header'
import { redirectToCheckout } from '@/lib/checkout'
import toast, { Toaster } from 'react-hot-toast'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time?: string
  venue: string
  location: string
  price?: number
  capacity?: number
  image?: string
  status: string
  soldTickets: number
  createdAt: string
  maxTicketsPerPurchase?: number
  youtubeUrl?: string
  ticketTiers?: Array<{
    id: string
    name: string
    price: number
    capacity: number
    description: string
  }>
  organizer?: {
    name: string
    email: string
    phone?: string
  }
  socialLinks?: {
    website?: string
    facebook?: string
    twitter?: string
    instagram?: string
  }
  tags?: string[]
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuantities, setSelectedQuantities] = useState<{ [tierId: string]: number }>({})
  const [totalPrice, setTotalPrice] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showShareToast, setShowShareToast] = useState(false)

  // Calculate total price when quantities change
  useEffect(() => {
    if (event?.ticketTiers) {
      const total = event.ticketTiers.reduce((sum, tier) => {
        const quantity = selectedQuantities[tier.id] || 0
        return sum + (tier.price * quantity)
      }, 0)
      setTotalPrice(total)
    } else if (event?.price) {
      const quantity = selectedQuantities['general'] || 0
      setTotalPrice(event.price * quantity)
    }
  }, [selectedQuantities, event])

  // Update quantity for a specific tier
  const updateQuantity = (tierId: string, newQuantity: number) => {
    const maxAllowed = event?.maxTicketsPerPurchase || 10
    const totalSelected = Object.values(selectedQuantities).reduce((sum, qty) => sum + qty, 0)
    const currentQuantity = selectedQuantities[tierId] || 0

    if (totalSelected - currentQuantity + newQuantity > maxAllowed) {
      return
    }

    setSelectedQuantities(prev => ({
      ...prev,
      [tierId]: Math.max(0, newQuantity)
    }))
  }

  const getTotalSelectedTickets = () => {
    return Object.values(selectedQuantities).reduce((sum, qty) => sum + qty, 0)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    toast(isLiked ? 'Removed from favorites' : 'Added to favorites', {
      icon: isLiked ? '💔' : '❤️'
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 3000)
  }

  const handlePurchase = async () => {
    try {
      if (!event) return

      const tickets = []

      if (event.ticketTiers) {
        for (const tier of event.ticketTiers) {
          const quantity = selectedQuantities[tier.id] || 0
          if (quantity > 0) {
            tickets.push({
              tierId: tier.id,
              tierName: tier.name,
              quantity,
              price: tier.price
            })
          }
        }
      } else {
        const quantity = selectedQuantities['general'] || 0
        if (quantity > 0) {
          tickets.push({
            tierId: 'general',
            tierName: 'General Admission',
            quantity,
            price: event.price || 50
          })
        }
      }

      if (tickets.length === 0) {
        toast.error('No tickets selected')
        return
      }

      if (!user?.emailAddresses?.[0]?.emailAddress) {
        toast.error('Please sign in to purchase tickets')
        router.push('/sign-in')
        return
      }

      const checkoutData = {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time || '19:00',
        venue: event.venue,
        tickets,
        customerEmail: user.emailAddresses[0].emailAddress
      }

      toast.loading('Redirecting to checkout...')
      await redirectToCheckout(checkoutData)

    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to proceed to checkout. Please try again.')
    }
  }

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch('/api/events', { cache: 'no-store' })
        if (response.ok) {
          const events = await response.json()
          const foundEvent = events.find((e: Event) => e.id === params.id)
          if (foundEvent) {
            setEvent(foundEvent)
          } else {
            setError('Event not found')
          }
        } else {
          setError('Failed to fetch event')
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        setError('An error occurred while fetching the event')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEvent()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The event you are looking for does not exist.'}</p>
          <Link href="/events" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Share Toast Notification */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300">
          <div className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Link copied to clipboard!
          </div>
        </div>
      )}

      <Header />

      {/* Hero Section */}
      <div className="relative">
        <div className="relative h-[60vh] overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700">
          {event.image && (
            <img
              src={event.image}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>

          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-8">
                <Link
                  href="/events"
                  className="flex items-center text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  <span className="font-medium">Back to Events</span>
                </Link>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLike}
                    className={`p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 ${isLiked
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white transition-all duration-200"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Event Title and Basic Info */}
              <div className="max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  {event.title}
                </h1>

                <div className="flex flex-wrap gap-6 text-white">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-300" />
                    <span className="text-lg">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {event.time && (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-300" />
                      <span className="text-lg">{event.time}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-300" />
                    <span className="text-lg">{event.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Event Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Event</h2>
              <div className="prose prose-gray max-w-none">
                {event.description.split(/\n/).map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Event Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube Video */}
            {event.youtubeUrl && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Preview</h3>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={event.youtubeUrl.replace('watch?v=', 'embed/')}
                    title="Event Preview"
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Organizer Info */}
            {event.organizer && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Organizer</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{event.organizer.name}</h4>
                    <p className="text-gray-600">{event.organizer.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            {(event.socialLinks?.website || event.socialLinks?.facebook || event.socialLinks?.twitter || event.socialLinks?.instagram) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect With Us</h3>
                <div className="flex flex-wrap gap-4">
                  {event.socialLinks?.website && (
                    <a
                      href={event.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                  {event.socialLinks?.facebook && (
                    <a
                      href={event.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Facebook className="h-4 w-4" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {event.socialLinks?.twitter && (
                    <a
                      href={event.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-sky-100 hover:bg-sky-200 text-sky-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {event.socialLinks?.instagram && (
                    <a
                      href={event.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-pink-100 hover:bg-pink-200 text-pink-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Ticket Purchase */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Event Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="space-y-4">
                  {/* Date and Time */}
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {event.time && (
                        <p className="text-gray-600">at {event.time}</p>
                      )}
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900">{event.venue}</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {(event.capacity || 0) - (event.soldTickets || 0)} spots available
                      </p>
                      <p className="text-gray-600">
                        {event.soldTickets || 0} of {event.capacity || 0} sold
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Tickets Sold</span>
                    <span>{Math.round(((event.soldTickets || 0) / (event.capacity || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round(((event.soldTickets || 0) / (event.capacity || 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Ticket Selection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" id="ticket-section">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Tickets</h3>

                {event.ticketTiers ? (
                  <div className="space-y-4">
                    {event.ticketTiers.map((tier) => (
                      <div key={tier.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                            <p className="text-sm text-gray-600">{tier.description}</p>
                          </div>
                          <p className="font-bold text-lg text-gray-900">${tier.price}</p>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(tier.id, (selectedQuantities[tier.id] || 0) - 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              disabled={(selectedQuantities[tier.id] || 0) === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-semibold w-8 text-center">
                              {selectedQuantities[tier.id] || 0}
                            </span>
                            <button
                              onClick={() => updateQuantity(tier.id, (selectedQuantities[tier.id] || 0) + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">
                            {tier.capacity - (tier.capacity * 0.1)} remaining
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">General Admission</h4>
                        <p className="text-sm text-gray-600">Access to the event</p>
                      </div>
                      <p className="font-bold text-lg text-gray-900">${event.price}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity('general', (selectedQuantities['general'] || 0) - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          disabled={(selectedQuantities['general'] || 0) === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-semibold w-8 text-center">
                          {selectedQuantities['general'] || 0}
                        </span>
                        <button
                          onClick={() => updateQuantity('general', (selectedQuantities['general'] || 0) + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        {(event.capacity || 0) - (event.soldTickets || 0)} remaining
                      </p>
                    </div>
                  </div>
                )}

                {/* Total and Purchase */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">${totalPrice}</span>
                  </div>

                  <button
                    onClick={handlePurchase}
                    disabled={getTotalSelectedTickets() === 0}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {getTotalSelectedTickets() === 0 ? 'Select Tickets' : `Purchase ${getTotalSelectedTickets()} Ticket${getTotalSelectedTickets() > 1 ? 's' : ''}`}
                  </button>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Secure checkout powered by Stripe
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    const eventDate = new Date(event?.date || '')
                    const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000)
                    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event?.title || '')}&dates=${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event?.description || '')}&location=${encodeURIComponent(event?.venue || '')}`
                    window.open(calendarUrl, '_blank')
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Add to Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}