import Link from 'next/link'
import { Calendar, MapPin, Users, Ticket } from 'lucide-react'
import Header from '@/components/Header'

export default async function Home() {
  // Mock events data - replace with MongoDB query
  const events: any[] = []

  // Get homepage content
  // const homepageContent = await prisma.homepageContent.findFirst({
  //   where: { isActive: true }
  // })

  // Get featured past events
  // const featuredPastEvents = await prisma.pastEvent.findMany({
  //   where: { featured: true, isPublished: true },
  //   orderBy: { date: 'desc' },
  //   take: 3
  // })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 -z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your Gateway to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                Amazing Concerts
              </span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Book tickets for the hottest concerts and music festivals. Secure payments, instant QR codes, and mobile wallet integration.
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
            <h2 className="text-3xl font-bold text-white mb-4">Upcoming Events</h2>
            <p className="text-gray-300 text-lg">Don't miss out on these amazing concerts</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-200">
                <div className="h-48 bg-gradient-to-br from-pink-500 to-purple-600 relative">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-6xl font-bold mb-2">🎵</div>
                        <div className="text-lg font-semibold">{event.title}</div>
                      </div>
                    </div>
                  )}
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

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-white">
                        $50+
                      </span>
                      <span className="text-gray-300 text-sm ml-1">from</span>
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
            ))}
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

      {/* Featured Past Events Section - Temporarily Disabled */}
      {/* {featuredPastEvents.length > 0 && (
        <div className="py-16 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Past Events Highlights</h2>
              <p className="text-gray-300 text-lg">Relive the amazing moments from our previous concerts</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPastEvents.map((event) => {
                const images = event.images ? JSON.parse(event.images) : []
                return (
                  <div key={event.id} className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-200">
                    <div className="h-48 bg-gradient-to-br from-gray-600 to-gray-800 relative overflow-hidden">
                      {images.length > 0 ? (
                        <img 
                          src={images[0]} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Calendar className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30"></div>
                      <div className="absolute bottom-4 left-4">
                        <div className="text-white text-2xl font-bold">{new Date(event.date).getDate()}</div>
                        <div className="text-white text-sm">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                      </div>
                      {event.youtubeUrl && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            VIDEO
                          </div>
                        </div>
                      )}
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
                      
                      {event.description && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {event.youtubeUrl && (
                        <div className="flex justify-center">
                          <a
                            href={event.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136C4.495 20.455 12 20.455 12 20.455s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            Watch Video
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )} */}

      {/* Announcement Section - Temporarily Disabled */}
      {/* {homepageContent?.announcement && (
        <div className="py-8 bg-gradient-to-r from-pink-600 to-purple-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-white text-lg font-medium">
              📢 {homepageContent.announcement}
            </p>
          </div>
        </div>
      )} */}

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