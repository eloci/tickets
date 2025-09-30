import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import Link from 'next/link'
import { Calendar, MapPin, Play } from 'lucide-react'

export default async function PastEventsPage() {
  // pastEvent model has been removed from schema
  const pastEvents: any[] = []

  /* COMMENTED OUT - pastEvent model doesn't exist
  // Get all published past events
  const pastEvents = await prisma.pastEvent.findMany({
    where: { isPublished: true },
    orderBy: { date: 'desc' }
  })
  */

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />

      {/* Header Section */}
      <div className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-black/20 -z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Past Events
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                {' '}Gallery
              </span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Relive the amazing moments from our previous concerts and music events
            </p>
          </div>
        </div>
      </div>

      {/* Past Events Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {pastEvents.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-white mb-4">No Past Events Yet</h3>
              <p className="text-gray-300 text-lg mb-8">Check back soon for highlights from our upcoming events!</p>
              <Link
                href="/events"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 inline-block"
              >
                Browse Upcoming Events
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map((event) => {
                const images = event.images ? JSON.parse(event.images) : []
                return (
                  <div key={event.id} className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                    <div className="h-64 bg-gradient-to-br from-gray-600 to-gray-800 relative overflow-hidden">
                      {images.length > 0 ? (
                        <img
                          src={images[0]}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : event.thumbnailUrl ? (
                        <img
                          src={event.thumbnailUrl}
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
                          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                            <Play className="w-3 h-3 mr-1" />
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
                        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                          {event.description}
                        </p>
                      )}

                      <div className="flex justify-between items-center">
                        {event.youtubeUrl && (
                          <a
                            href={event.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 flex items-center text-sm"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Watch Video
                          </a>
                        )}

                        {images.length > 0 && (
                          <div className="text-gray-300 text-xs">
                            {images.length} image{images.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      {/* Image Gallery Preview */}
                      {images.length > 1 && (
                        <div className="mt-4 grid grid-cols-4 gap-2">
                          {images.slice(1, 5).map((image: string, index: number) => (
                            <div key={index} className="aspect-square bg-gray-700 rounded overflow-hidden">
                              <img
                                src={image}
                                alt={`${event.title} - Image ${index + 2}`}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                              />
                            </div>
                          ))}
                          {images.length > 5 && (
                            <div className="aspect-square bg-black/50 rounded flex items-center justify-center text-white text-xs font-semibold">
                              +{images.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready for the Next Event?</h2>
          <p className="text-gray-300 text-lg mb-8">Don't miss out on upcoming concerts and festivals!</p>
          <Link
            href="/events"
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 inline-block"
          >
            Browse Upcoming Events
          </Link>
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