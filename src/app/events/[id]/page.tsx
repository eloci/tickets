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
  FileText,
  Tag,
  Play,
  Plus,
  Minus,
  Calendar as CalendarIcon,
  Timer,
  Globe,
  Facebook,
  Twitter,
  Instagram
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
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isLiked, setIsLiked] = useState(false)
  const [showShareToast, setShowShareToast] = useState(false)

  // Countdown Timer Effect
  useEffect(() => {
    if (!event?.date) return

    const calculateTimeLeft = () => {
      const eventDate = new Date(event.date)
      if (event.time) {
        const [hours, minutes] = event.time.split(':')
        eventDate.setHours(parseInt(hours), parseInt(minutes))
      }

      const now = new Date()
      const difference = eventDate.getTime() - now.getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [event?.date, event?.time])

  // Calculate total price when quantities change
  useEffect(() => {
    if (event?.ticketTiers) {
      const total = event.ticketTiers.reduce((sum, tier) => {
        const quantity = selectedQuantities[tier.id] || 0
        return sum + (tier.price * quantity)
      }, 0)
      setTotalPrice(total)
    }
  }, [selectedQuantities, event])

  // Update quantity for a specific tier
  const updateQuantity = (tierId: string, newQuantity: number) => {
    const maxAllowed = event?.maxTicketsPerPurchase || 10
    const totalSelected = Object.values(selectedQuantities).reduce((sum, qty) => sum + qty, 0)
    const currentQuantity = selectedQuantities[tierId] || 0

    // Check if the new total would exceed the limit
    if (totalSelected - currentQuantity + newQuantity > maxAllowed) {
      return // Don't update if it would exceed the limit
    }

    setSelectedQuantities(prev => ({
      ...prev,
      [tierId]: Math.max(0, newQuantity)
    }))
  }

  // Get total selected tickets across all tiers
  const getTotalSelectedTickets = () => {
    return Object.values(selectedQuantities).reduce((sum, qty) => sum + qty, 0)
  }

  // Calculate total capacity across all tiers
  const getTotalCapacity = () => {
    if (!event) return 0
    if (event.ticketTiers && event.ticketTiers.length > 0) {
      return event.ticketTiers.reduce((sum, tier) => sum + tier.capacity, 0)
    }
    return event.capacity || 0
  }

  // Calculate total available spots (capacity - sold - currently selected)
  const getTotalAvailableSpots = () => {
    const totalCapacity = getTotalCapacity()
    const soldTickets = event?.soldTickets || 0
    const selectedTickets = getTotalSelectedTickets()
    return Math.max(0, totalCapacity - soldTickets - selectedTickets)
  }

  // Calculate remaining tickets for a specific tier
  const getTierRemainingTickets = (tier: any) => {
    const soldForTier = event?.soldTickets || 0 // Simplified - in production you'd track per tier
    const tierCapacity = tier.capacity
    const selectedForTier = selectedQuantities[tier.id] || 0
    return Math.max(0, tierCapacity - soldForTier - selectedForTier)
  }

  // Handle like/favorite functionality
  const handleLike = () => {
    setIsLiked(!isLiked)
    // In a real app, you'd save this to localStorage or backend
    if (!isLiked) {
      // Show a nice animation or feedback
      const timer = setTimeout(() => {
        // Any additional feedback logic
      }, 300)
      return () => clearTimeout(timer)
    }
  }

  // Handle share functionality
  const handleShare = async () => {
    const shareData = {
      title: event?.title || 'Amazing Event',
      text: `Check out this amazing event: ${event?.title}`,
      url: window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 3000)
      }
    } catch (error) {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 3000)
      } catch (clipboardError) {
        // Silent error handling
      }
    }
  }

  // Handle checkout process
  const handleCheckout = async () => {
    try {
      if (!event) return

      // Validate selections
      const totalSelected = getTotalSelectedTickets()
      if (totalSelected === 0) {
        toast.error('Please select at least one ticket')
        return
      }

      // Prepare ticket data for checkout
      const tickets = []

      if (event.ticketTiers && event.ticketTiers.length > 0) {
        // Multiple tiers
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
        // Single tier (general admission)
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

      // Check if user is logged in
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        toast.error('Please sign in to purchase tickets')
        router.push('/sign-in')
        return
      }

      // Prepare checkout data
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

      // Redirect to Stripe checkout
      await redirectToCheckout(checkoutData)

    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to proceed to checkout. Please try again.')
    }
  }

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch('/api/events')
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
        setError('Failed to fetch event')
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-white text-xl">Loading event...</div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="text-red-400 text-xl mb-4">{error || 'Event not found'}</div>
          <Link
            href="/events"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
          >
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Share Toast Notification */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 animate-fade-in-up">
          <div className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Link copied to clipboard!
          </div>
        </div>
      )}

      <Header />

      {/* Enhanced Special Hero Section */}
      <div className="relative overflow-hidden min-h-[80vh] flex items-end">
        {/* Sophisticated Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 -z-10"></div>

        {/* Elegant Floating Geometric Shapes */}
        <div className="absolute inset-0 -z-15">
          <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-sm animate-pulse"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-r from-purple-400/15 to-blue-500/15 rounded-full blur-sm animate-bounce"></div>
          <div className="absolute bottom-40 left-1/4 w-8 h-8 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-sm animate-ping"></div>
          <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-gradient-to-r from-slate-400/15 to-blue-500/15 rounded-full blur-sm animate-pulse delay-300"></div>

          {/* Refined Animated Particles */}
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-300/15 rounded-full animate-float delay-700"></div>
          <div className="absolute top-3/4 right-1/3 w-2 h-2 bg-indigo-300/15 rounded-full animate-float delay-1200"></div>
          <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-purple-300/20 rounded-full animate-float delay-2500"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-slate-300/15 rounded-full animate-float delay-1800"></div>
          <div className="absolute top-3/4 left-1/6 w-1 h-1 bg-blue-300/15 rounded-full animate-float delay-900"></div>
          <div className="absolute bottom-1/4 right-1/6 w-1 h-1 bg-indigo-300/10 rounded-full animate-float delay-2200"></div>
        </div>

        {event.image ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 -z-20 transition-transform duration-2000 hover:scale-105"
              style={{ backgroundImage: `url(${event.image})` }}
            />
            {/* Sophisticated Gradient Overlay with Animation */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-slate-900/40 to-transparent -z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-transparent to-blue-900/20 -z-10"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-indigo-900 to-blue-900 -z-20 animate-gradient-x">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
          {/* Enhanced Navigation with Glow Effects */}
          <div className="flex items-center justify-between mb-16 pt-8">
            <Link
              href="/events"
              className="group flex items-center text-white/80 hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              <div className="p-4 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span className="ml-3 font-medium">Back to Events</span>
            </Link>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`p-4 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl ${isLiked
                  ? 'bg-red-500/80 hover:bg-red-500/90 text-white shadow-red-500/25'
                  : 'bg-white/10 hover:bg-red-500/30 text-white hover:shadow-red-500/25'
                  }`}
              >
                <Heart className={`h-5 w-5 transition-all duration-300 ${isLiked ? 'fill-current scale-110' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-blue-500/30 text-white transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-w-5xl">
            {/* Elegant Special Badge */}
            <div className="mb-8 animate-fade-in-up">
              <span className="inline-flex items-center px-16 py-8 rounded-full text-3xl md:text-6xl font-black text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20">
                <Star className="h-10 w-10 md:h-16 md:w-16 mr-6 animate-spin" />
                ✨ {event.title.toUpperCase()} ✨
                <Star className="h-10 w-10 md:h-16 md:w-16 ml-6 animate-spin" />
              </span>
            </div>

            {/* Enhanced Event Meta with Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Date Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 hover:bg-white/20 group animate-fade-in-up delay-400">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-medium">Event Date</p>
                    <p className="text-white font-bold text-lg">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Venue Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 hover:bg-white/20 group animate-fade-in-up delay-500">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-medium">Venue</p>
                    <p className="text-white font-bold text-lg">{event.venue}</p>
                  </div>
                </div>
              </div>

              {/* Time Card */}
              {event.time && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 hover:bg-white/20 group animate-fade-in-up delay-600">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-gradient-to-r from-slate-500 to-blue-600 group-hover:shadow-lg group-hover:shadow-slate-500/25 transition-all duration-300">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">Time</p>
                      <p className="text-white font-bold text-lg">{event.time}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Stats Row - Countdown Timer, Organizer & Tickets Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up delay-600">

              {/* Countdown Timer Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 shadow-xl">
                <div className="text-center">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-center">
                    <Timer className="h-5 w-5 mr-2" />
                    Event Starts In
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-3">
                      <div className="text-xl font-bold text-white">{timeLeft.days}</div>
                      <div className="text-white/80 text-xs font-medium">Days</div>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-3">
                      <div className="text-xl font-bold text-white">{timeLeft.hours}</div>
                      <div className="text-white/80 text-xs font-medium">Hours</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-slate-600 rounded-xl p-3">
                      <div className="text-xl font-bold text-white">{timeLeft.minutes}</div>
                      <div className="text-white/80 text-xs font-medium">Minutes</div>
                    </div>
                    <div className="bg-gradient-to-r from-slate-500 to-gray-600 rounded-xl p-3">
                      <div className="text-xl font-bold text-white">{timeLeft.seconds}</div>
                      <div className="text-white/80 text-xs font-medium">Seconds</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Organizer Card */}
              {event.organizer && (
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-md border border-indigo-300/30 rounded-2xl p-6 hover:border-indigo-300/50 transition-all duration-300 shadow-xl">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 rounded-full bg-indigo-500/30">
                      <Users className="h-4 w-4 text-indigo-200" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Organizer</h3>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Organizer Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>

                    {/* Organizer Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm truncate">{event.organizer.name}</h4>
                      <p className="text-indigo-200 text-xs truncate">{event.organizer.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tickets Sold Progress Card */}
              <div className="bg-gradient-to-br from-blue-500/20 to-green-600/20 backdrop-blur-md border border-blue-300/30 rounded-2xl p-6 hover:border-green-300/50 transition-all duration-300 shadow-xl">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 rounded-full bg-blue-500/30">
                    <Ticket className="h-4 w-4 text-blue-200" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Tickets Sold</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Progress</span>
                    <span className="text-white font-bold text-lg">{Math.round((event.soldTickets || 0) / (event.capacity || 1) * 100)}%</span>
                  </div>

                  <div className="w-full bg-gray-700/50 rounded-full h-2.5 backdrop-blur-sm border border-gray-600/30">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-700 ease-out shadow-lg shadow-blue-500/20"
                      style={{ width: `${Math.round((event.soldTickets || 0) / (event.capacity || 1) * 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-300">
                    <span>{event.soldTickets || 0} sold</span>
                    <span>{event.capacity || 0} total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action Buttons */}
            {/* Enhanced Call to Action Buttons */}
            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-800">
              <button
                onClick={() => {
                  // Scroll to ticket section
                  const ticketSection = document.getElementById('ticket-section')
                  if (ticketSection) {
                    ticketSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-600 to-slate-700 text-white rounded-2xl font-bold text-lg transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  🎫 Get Tickets Now
                  <Ticket className="h-5 w-5 ml-2 group-hover:animate-bounce" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => {
                  // Add to calendar functionality
                  const eventDate = new Date(event?.date || '')
                  const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000) // 3 hours later
                  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event?.title || '')}&dates=${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event?.description || '')}&location=${encodeURIComponent(event?.venue || '')}`
                  window.open(calendarUrl, '_blank')
                }}
                className="group px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-2xl font-bold text-lg transform hover:scale-105 transition-all duration-300 hover:bg-white/20 hover:border-white/50 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center">
                  📅 Add to Calendar
                  <CalendarIcon className="h-5 w-5 ml-2 group-hover:animate-pulse" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Enhanced Layout */}
      <div className="relative -mt-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl space-y-4">

            {/* Event Description - Sophisticated Style */}
            <div className="bg-gradient-to-br from-slate-500/20 to-blue-600/20 backdrop-blur-md border border-slate-300/30 rounded-2xl p-8 hover:border-blue-300/50 transition-all duration-300 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">About This Event</h2>
              </div>

              {/* Event Image with Sticked Tags */}
              {event.image && (
                <div className="mb-6">
                  <div className="relative rounded-xl overflow-hidden shadow-2xl">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-64 md:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                    {/* Tags Sticked to Photo */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg backdrop-blur-sm border border-white/20"
                              style={{
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.3)'
                              }}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Event Image Fallback (when no image) - Show tags separately */}
              {!event.image && event.tags && event.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-3">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-lg transform hover:scale-105 transition-all duration-200"
                        style={{
                          boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
                        }}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-gray-200 leading-relaxed text-lg">
                {event.description.split(/\n/).map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* YouTube Video - Elegant Style */}
            {event.youtubeUrl && (
              <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-md border border-indigo-300/30 rounded-2xl p-8 hover:border-purple-300/50 transition-all duration-300 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Event Preview</h2>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    src={event.youtubeUrl.includes('watch?v=') ? event.youtubeUrl.replace('watch?v=', 'embed/') : event.youtubeUrl}
                    title="Event Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Social Media Links - Sophisticated Design */}
            {(event.socialLinks?.website || event.socialLinks?.facebook || event.socialLinks?.twitter || event.socialLinks?.instagram) && (
              <div className="bg-gradient-to-br from-blue-500/20 to-slate-600/20 backdrop-blur-md border border-blue-300/30 rounded-2xl p-8 hover:border-slate-300/50 transition-all duration-300 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-slate-600 shadow-lg">
                    <Share2 className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Connect With Us</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {event.socialLinks?.website && (
                    <a
                      href={event.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 bg-gray-500/30 hover:bg-gray-500/50 text-gray-200 hover:text-white px-4 py-3 rounded-xl transition-all duration-200 border border-gray-400/30 hover:border-gray-400/60"
                    >
                      <Globe className="h-5 w-5" />
                      <span className="font-medium">Website</span>
                    </a>
                  )}
                  {event.socialLinks?.facebook && (
                    <a
                      href={event.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white px-4 py-3 rounded-xl transition-all duration-200 border border-blue-400/30 hover:border-blue-400/60"
                    >
                      <Facebook className="h-5 w-5" />
                      <span className="font-medium">Facebook</span>
                    </a>
                  )}
                  {event.socialLinks?.twitter && (
                    <a
                      href={event.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 hover:text-white px-4 py-3 rounded-xl transition-all duration-200 border border-sky-400/30 hover:border-sky-400/60"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="font-medium">Twitter</span>
                    </a>
                  )}
                  {event.socialLinks?.instagram && (
                    <a
                      href={event.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 bg-pink-600/30 hover:bg-pink-600/50 text-pink-200 hover:text-white px-4 py-3 rounded-xl transition-all duration-200 border border-pink-400/30 hover:border-pink-400/60"
                    >
                      <Instagram className="h-5 w-5" />
                      <span className="font-medium">Instagram</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Ticket Purchase Section - Moved Under Event Preview */}
            <div id="ticket-section" className="relative space-y-4">
              {/* Ticket Purchase Card - Enhanced */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md border border-purple-300/30 rounded-2xl p-8 hover:border-purple-300/50 transition-all duration-300 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Get Your Tickets</h2>
                  <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                    <Ticket className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Max tickets info */}
                {event.maxTicketsPerPurchase && (
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-6">
                    <p className="text-blue-200 text-sm">
                      <span className="font-semibold">Max {event.maxTicketsPerPurchase} tickets</span> per purchase
                    </p>
                  </div>
                )}

                {event.status === 'PUBLISHED' ? (
                  <div className="space-y-4">
                    {event.ticketTiers && event.ticketTiers.length > 0 ? (
                      <>
                        {event.ticketTiers.map((tier) => {
                          const currentQuantity = selectedQuantities[tier.id] || 0
                          const tierAvailable = tier.capacity - (event.soldTickets || 0)
                          const remaining = Math.max(0, tierAvailable - currentQuantity)
                          const isAvailable = tierAvailable > 0 && remaining >= 0
                          const maxForThisTier = Math.min(
                            tierAvailable,
                            (event.maxTicketsPerPurchase || 10) - getTotalSelectedTickets() + currentQuantity
                          )

                          return (
                            <div key={tier.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200">
                              {/* Tier Header */}
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-xl font-semibold text-white mb-1">{tier.name}</h3>
                                  <p className="text-gray-300 text-sm">{tier.description}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-3xl font-bold text-white">{tier.price}€</span>
                                  <p className="text-gray-400 text-xs">per ticket</p>
                                </div>
                              </div>

                              {/* Availability Indicator */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                  <span className="text-gray-400 text-sm">
                                    {tierAvailable > 0 ? `${remaining} of ${tierAvailable} remaining` : 'Sold out'}
                                  </span>
                                </div>
                                {currentQuantity > 0 && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-yellow-400 text-sm">Selected: {currentQuantity}</span>
                                  </div>
                                )}
                              </div>

                              {/* Quantity Selector */}
                              {isAvailable ? (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-white font-medium">Quantity</span>
                                    <div className="flex items-center space-x-3">
                                      <button
                                        onClick={() => updateQuantity(tier.id, currentQuantity - 1)}
                                        disabled={currentQuantity <= 0}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                      >
                                        <Minus className="h-4 w-4 text-white" />
                                      </button>

                                      <span className="text-white font-bold text-lg min-w-[3rem] text-center">
                                        {currentQuantity}
                                      </span>

                                      <button
                                        onClick={() => updateQuantity(tier.id, currentQuantity + 1)}
                                        disabled={currentQuantity >= maxForThisTier}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                      >
                                        <Plus className="h-4 w-4 text-white" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Subtotal for this tier */}
                                  {currentQuantity > 0 && (
                                    <div className="bg-white/10 rounded-lg p-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-300">
                                          {currentQuantity} × {tier.price}€
                                        </span>
                                        <span className="text-white font-bold">
                                          {tier.price * currentQuantity}€
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <div className="text-red-400 font-medium">Sold Out</div>
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Total and Checkout */}
                        {getTotalSelectedTickets() > 0 && (
                          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 mt-6">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-white font-medium">Total Tickets</span>
                                <span className="text-white font-bold">{getTotalSelectedTickets()}</span>
                              </div>

                              <div className="flex justify-between items-center text-xl">
                                <span className="text-white font-bold">Total Price</span>
                                <span className="text-white font-bold">{totalPrice}€</span>
                              </div>

                              <button
                                onClick={handleCheckout}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 mb-8"
                              >
                                <Ticket className="h-6 w-6" />
                                <span>Proceed to Checkout</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-semibold text-white">General Admission</h3>
                          <span className="text-3xl font-bold text-white">{event.price || 50}€</span>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">Quantity</span>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => updateQuantity('general', (selectedQuantities['general'] || 0) - 1)}
                                disabled={(selectedQuantities['general'] || 0) <= 0}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              >
                                <Minus className="h-4 w-4 text-white" />
                              </button>

                              <span className="text-white font-bold text-lg min-w-[3rem] text-center">
                                {selectedQuantities['general'] || 0}
                              </span>

                              <button
                                onClick={() => updateQuantity('general', (selectedQuantities['general'] || 0) + 1)}
                                disabled={(selectedQuantities['general'] || 0) >= (event.maxTicketsPerPurchase || 10)}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              >
                                <Plus className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          </div>

                          {(selectedQuantities['general'] || 0) > 0 && (
                            <>
                              <div className="bg-white/10 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-300">
                                    {selectedQuantities['general']} × {event.price || 50}€
                                  </span>
                                  <span className="text-white font-bold">
                                    {(event.price || 50) * (selectedQuantities['general'] || 0)}€
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={handleCheckout}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 mb-8"
                              >
                                <Ticket className="h-6 w-6" />
                                <span>Proceed to Checkout</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-600/30 flex items-center justify-center">
                      <Ticket className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Not Available</h3>
                    <p className="text-gray-300">Tickets are not currently available for this event.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer spacer */}
      <div className="h-8"></div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}