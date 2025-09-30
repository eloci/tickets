import Header from '@/components/Header'
import Link from 'next/link'
import { Calendar, MapPin, Users, Clock, Star, ArrowRight } from 'lucide-react'

export default async function EventsPage() {
  // Mock events data - replace with MongoDB query
  const events = [
    {
      id: '1',
      title: 'Summer Music Festival 2025',
      description: 'Join us for an amazing night of music with top artists from around the world. Experience the magic of live music under the stars.',
      date: new Date('2025-07-15'),
      venue: 'Central Park Amphitheater',
      location: 'New York, NY',
      price: 75,
      capacity: 1000,
      soldTickets: 485,
      imageUrl: '/placeholder-event.jpg',
      featured: true,
      category: 'Music Festival'
    },
    {
      id: '2',
      title: 'Rock Concert Extravaganza',
      description: 'Experience the best rock bands live in an unforgettable night of pure rock energy and incredible performances.',
      date: new Date('2025-08-20'),
      venue: 'Madison Square Garden',
      location: 'New York, NY',
      price: 65,
      capacity: 800,
      soldTickets: 320,
      imageUrl: '/placeholder-event.jpg',
      featured: false,
      category: 'Rock Concert'
    },
    {
      id: '3',
      title: 'Jazz Night Special',
      description: 'Smooth jazz under the stars with renowned jazz musicians from around the globe. An intimate evening of sophisticated music.',
      date: new Date('2025-09-10'),
      venue: 'Blue Note Club',
      location: 'New York, NY',
      price: 45,
      capacity: 300,
      soldTickets: 150,
      imageUrl: '/placeholder-event.jpg',
      featured: true,
      category: 'Jazz'
    },
    {
      id: '4',
      title: 'Electronic Dance Paradise',
      description: 'The biggest EDM event of the year featuring world-class DJs and cutting-edge production.',
      date: new Date('2025-10-05'),
      venue: 'Brooklyn Warehouse',
      location: 'Brooklyn, NY',
      price: 85,
      capacity: 1200,
      soldTickets: 720,
      imageUrl: '/placeholder-event.jpg',
      featured: false,
      category: 'Electronic'
    }
  ]

  const featuredEvents = events.filter(event => event.featured)
  const upcomingEvents = events.filter(event => !event.featured)

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
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && (
        <div className="relative -mt-12 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-yellow-400 mr-3" />
                Featured Events
              </h2>
              <p className="text-gray-300">Don't miss these amazing upcoming events</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {featuredEvents.map((event) => (
                <div key={event.id} className="group bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="relative h-64 bg-gradient-to-br from-purple-500 to-blue-600">
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        FEATURED
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                      <p className="text-sm opacity-90">{event.category}</p>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">{event.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-5 w-5 mr-3 text-purple-500" />
                        <span className="font-medium">{event.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <MapPin className="h-5 w-5 mr-3 text-purple-500" />
                        <span>{event.venue}, {event.location}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <Users className="h-5 w-5 mr-3 text-purple-500" />
                        <span>{event.soldTickets} / {event.capacity} tickets sold</span>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Tickets sold</span>
                        <span>{Math.round((event.soldTickets / event.capacity) * 100)}% sold</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${(event.soldTickets / event.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-3xl font-bold text-purple-600">${event.price}</span>
                        <span className="text-gray-500 text-lg"> per ticket</span>
                      </div>
                      
                      <Link
                        href={`/events/${event.id}`}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center font-semibold"
                      >
                        Book Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Events Section */}
      <div className="bg-gradient-to-b from-transparent to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">All Upcoming Events</h2>
            <p className="text-gray-300">Explore our complete collection of amazing events</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="relative h-48 bg-gradient-to-br from-purple-500 to-blue-600">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white bg-opacity-90 text-purple-600 px-2 py-1 rounded-full text-xs font-bold">
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{event.title}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">{event.date.toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">{event.venue}, {event.location}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">{event.soldTickets} / {event.capacity} tickets sold</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-purple-600">${event.price}</span>
                      <span className="text-gray-500"> per ticket</span>
                    </div>
                    
                    <Link
                      href={`/events/${event.id}`}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Tickets sold</span>
                      <span>{Math.round((event.soldTickets / event.capacity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(event.soldTickets / event.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {events.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
                <p className="text-gray-500">Check back later for upcoming events!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}