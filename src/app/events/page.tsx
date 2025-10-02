'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Users, Ticket } from 'lucide-react'
import Header from '@/components/Header'

interface Event {
  id: string
  title: string
  description: string
  date: string
  venue: string
  image?: string
  price?: number
  capacity?: number
  soldTickets?: number
  ticketTiers?: Array<{
    id: string
    name: string
    price: number
    capacity: number
    description: string
  }>
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  // Calculate remaining spots for an event
  const calculateRemainingSpots = (event: Event): number => {
    if (event.ticketTiers && event.ticketTiers.length > 0) {
      // Sum up all tier capacities
      const totalCapacity = event.ticketTiers.reduce((sum, tier) => sum + tier.capacity, 0)
      return Math.max(0, totalCapacity - (event.soldTickets || 0))
    } else if (event.capacity) {
      // Use single capacity
      return Math.max(0, event.capacity - (event.soldTickets || 0))
    }
    return 0
  }

  // Calculate total capacity for an event
  const getTotalCapacity = (event: Event): number => {
    if (event.ticketTiers && event.ticketTiers.length > 0) {
      return event.ticketTiers.reduce((sum, tier) => sum + tier.capacity, 0)
    } else if (event.capacity) {
      return event.capacity
    }
    return 0
  }

  // Calculate tickets sold percentage
  const getTicketsSoldPercentage = (event: Event): number => {
    const totalCapacity = getTotalCapacity(event)
    const soldTickets = event.soldTickets || 0
    return totalCapacity > 0 ? Math.round((soldTickets / totalCapacity) * 100) : 0
  }

  // Get ribbon color and text based on remaining spots
  const getRibbonInfo = (remainingSpots: number, totalCapacity: number) => {
    const percentage = totalCapacity > 0 ? (remainingSpots / totalCapacity) * 100 : 0

    if (remainingSpots === 0) {
      return { color: 'bg-red-500', text: 'SOLD OUT' }
    } else if (percentage <= 10) {
      return { color: 'bg-red-500', text: `${remainingSpots} LEFT` }
    } else if (percentage <= 25) {
      return { color: 'bg-orange-500', text: `${remainingSpots} LEFT` }
    } else if (percentage <= 50) {
      return { color: 'bg-yellow-500', text: `${remainingSpots} LEFT` }
    } else {
      return { color: 'bg-green-500', text: `${remainingSpots} SPOTS` }
    }
  }

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events', { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          // Show only the first 3 events on homepage
          setEvents(Array.isArray(data) ? data : [])
        } else {
          setEvents([])
        }
      } catch (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 -z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover Amazing
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                {' '}Events
              </span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              From intimate jazz nights to massive music festivals - find your perfect event and book instantly with secure payments and QR code tickets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/events"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">All Events</h2>
            <p className="text-gray-300 text-lg">Find your perfect event and book now</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading state
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-600"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-600 rounded mb-2"></div>
                    <div className="h-4 bg-gray-600 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-600 rounded mb-4 w-1/2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-gray-600 rounded w-20"></div>
                      <div className="h-10 bg-gray-600 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : events && events.length > 0 ? (
              events.map((event) => {
                // Calculate minimum price from ticketTiers or use fallback price
                const minPrice = event.ticketTiers && event.ticketTiers.length > 0
                  ? Math.min(...event.ticketTiers.map(tier => tier.price))
                  : event.price || 50

                // Calculate remaining spots and total capacity
                const remainingSpots = calculateRemainingSpots(event)
                const totalCapacity = event.ticketTiers && event.ticketTiers.length > 0
                  ? event.ticketTiers.reduce((sum, tier) => sum + tier.capacity, 0)
                  : event.capacity || 0
                const ribbonInfo = getRibbonInfo(remainingSpots, totalCapacity)

                return (
                  <div key={event.id} className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-200 relative">
                    {/* Availability Ribbon */}
                    <div className={`absolute top-4 right-4 z-10 ${ribbonInfo.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-12`}>
                      {ribbonInfo.text}
                    </div>

                    <div className="h-48 bg-gradient-to-br from-pink-500 to-purple-600 relative">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Homepage image failed to load:', event.image)
                            // Hide the broken image and show fallback
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : null}
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center"
                        style={{ display: event.image ? 'none' : 'flex' }}
                      >
                        <div className="text-center text-white">
                          <div className="text-6xl font-bold mb-2">🎵</div>
                          <div className="text-lg font-semibold">{event.title}</div>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/30"></div>
                      <div className="absolute bottom-4 left-4">
                        <div className="text-white text-2xl font-bold">{new Date(event.date).getDate()}</div>
                        <div className="text-white text-sm">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                      <div className="flex items-center text-gray-300 mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{event.venue}</span>
                      </div>
                      <div className="flex items-center text-gray-300 mb-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                      </div>

                      {/* Tickets Sold Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-300 flex items-center">
                            <Ticket className="h-3 w-3 mr-1" />
                            Tickets sold
                          </span>
                          <span className="text-sm font-bold text-blue-400">{getTicketsSoldPercentage(event)}%</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2.5 backdrop-blur-sm border border-gray-600/30">
                          <div
                            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-700 ease-out shadow-lg shadow-blue-500/20"
                            style={{ width: `${getTicketsSoldPercentage(event)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                          <span>{event.soldTickets || 0} sold</span>
                          <span>{getTotalCapacity(event)} total</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold text-white">
                            from {minPrice}€+
                          </span>
                        </div>
                        <Link
                          href={`/events/${event.id}`}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                        >
                          Get Tickets
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              // Empty state
              <div className="col-span-full text-center py-12">
                <div className="text-white text-xl mb-4">🎵</div>
                <h3 className="text-xl font-bold text-white mb-2">No Upcoming Events</h3>
                <p className="text-gray-300 mb-6">Check back soon for new concerts and events!</p>
                <Link
                  href="/events"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 inline-block"
                >
                  Browse All Events
                </Link>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/events"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-900 transition-all duration-200 inline-block"
            >
              View All Events
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Our Platform?</h2>
            <p className="text-gray-300 text-lg">Experience the future of concert ticketing</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm">
              <Ticket className="h-12 w-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Secure QR Tickets</h3>
              <p className="text-gray-300">Crypto-signed QR codes for maximum security</p>
            </div>

            <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm">
              <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Multiple Payment Options</h3>
              <p className="text-gray-300">Stripe, PayPal, Apple Pay, Google Pay supported</p>
            </div>

            <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm">
              <MapPin className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Mobile Wallet Ready</h3>
              <p className="text-gray-300">Add tickets to Apple Wallet & Google Pay</p>
            </div>

            <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm">
              <Calendar className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Instant Delivery</h3>
              <p className="text-gray-300">Get your tickets immediately via email</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Concert Tickets</h3>
            <p className="text-gray-300 mb-6">Your trusted platform for concert ticket booking</p>
            <div className="flex justify-center space-x-6">
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms</Link>
            </div>
            <div className="mt-6 text-gray-400 text-sm">
              2024 Concert Tickets. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}