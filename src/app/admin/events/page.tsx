'use client'

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
  TrendingUp
} from 'lucide-react'

export default function AdminEventsPage() {
  // Mock data - replace with actual data fetching
  const events = [
    {
      id: '1',
      title: 'Summer Music Festival',
      description: 'An amazing outdoor music festival featuring top artists from around the world.',
      date: '2025-07-15',
      venue: 'Central Park',
      location: 'New York, NY',
      price: 150,
      capacity: 5000,
      soldTickets: 3200,
      status: 'PUBLISHED',
      createdAt: '2025-01-01T10:00:00Z',
      imageUrl: '/placeholder-event.jpg',
      category: 'Music'
    },
    {
      id: '2',
      title: 'Tech Conference 2025',
      description: 'Join industry leaders and innovators for a day of insightful talks and networking.',
      date: '2025-05-20',
      venue: 'Convention Center',
      location: 'San Francisco, CA',
      price: 200,
      capacity: 1000,
      soldTickets: 850,
      status: 'PUBLISHED',
      createdAt: '2025-01-05T14:30:00Z',
      imageUrl: '/placeholder-event.jpg',
      category: 'Technology'
    },
    {
      id: '3',
      title: 'Jazz Night Special',
      description: 'Smooth jazz under the stars with renowned jazz musicians.',
      date: '2025-09-10',
      venue: 'Blue Note Club',
      location: 'New York, NY',
      price: 45,
      capacity: 300,
      soldTickets: 150,
      status: 'DRAFT',
      createdAt: '2025-01-08T15:20:00Z',
      imageUrl: '/placeholder-event.jpg',
      category: 'Jazz'
    }
  ]

  const totalEvents = events.length
  const publishedEvents = events.filter(e => e.status === 'PUBLISHED').length
  const draftEvents = events.filter(e => e.status === 'DRAFT').length
  const totalRevenue = events.reduce((sum, event) => sum + (event.soldTickets * event.price), 0)

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
                  <p className="text-xs text-gray-400">{Math.round((publishedEvents/totalEvents)*100)}% of total</p>
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
                  <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
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
            {events.map((event) => (
              <div key={event.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="relative h-48 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-4 right-4">
                    <span className={getStatusBadge(event.status)}>
                      {event.status}
                    </span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm font-medium">{event.category}</span>
                    </div>
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
                      <span>{event.venue}, {event.location}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <DollarSign className="h-4 w-4 mr-3 text-purple-400" />
                      <span>${event.price} • {event.soldTickets}/{event.capacity} sold</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Tickets sold</span>
                      <span>{Math.round((event.soldTickets / event.capacity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(event.soldTickets / event.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                        title="Edit Event"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/events/${event.id}`}
                        className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                        title="View Event"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                        title="Delete Event"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this event?')) {
                            // Add delete functionality here
                            console.log('Deleting event:', event.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        Revenue: <span className="text-white font-medium">${(event.soldTickets * event.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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