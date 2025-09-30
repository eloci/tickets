import Header from '@/components/Header'
import Link from 'next/link'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'

export default async function EventsPage() {
  // Mock events data - replace with MongoDB query
  const events = [
    {
      id: '1',
      title: 'Summer Music Festival 2025',
      description: 'Join us for an amazing night of music with top artists from around the world.',
      date: new Date('2025-07-15'),
      venue: 'Central Park Amphitheater',
      location: 'New York, NY',
      price: 75,
      capacity: 1000,
      soldTickets: 485,
      imageUrl: '/placeholder-event.jpg'
    },
    {
      id: '2',
      title: 'Rock Concert Extravaganza',
      description: 'Experience the best rock bands live in an unforgettable night.',
      date: new Date('2025-08-20'),
      venue: 'Madison Square Garden',
      location: 'New York, NY',
      price: 65,
      capacity: 800,
      soldTickets: 320,
      imageUrl: '/placeholder-event.jpg'
    },
    {
      id: '3',
      title: 'Jazz Night Special',
      description: 'Smooth jazz under the stars with renowned jazz musicians.',
      date: new Date('2025-09-10'),
      venue: 'Blue Note Club',
      location: 'New York, NY',
      price: 45,
      capacity: 300,
      soldTickets: 150,
      imageUrl: '/placeholder-event.jpg'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Upcoming Events</h1>
          <p className="text-xl text-gray-600">Discover amazing events happening near you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-purple-500 to-blue-600">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{event.title}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{event.date.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.venue}, {event.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.soldTickets} / {event.capacity} tickets sold</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-purple-600">${event.price}</span>
                    <span className="text-gray-500"> per ticket</span>
                  </div>
                  
                  <Link
                    href={`/events/${event.id}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    View Details
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
                      className="bg-purple-600 h-2 rounded-full" 
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
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
            <p className="text-gray-500">Check back later for upcoming events!</p>
          </div>
        )}
      </div>
    </div>
  )
}