import Header from '@/components/Header'
import Link from 'next/link'
import { Calendar, Users, DollarSign, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function AdminEvents() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  // Check if user is admin
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  if (!user || user.publicMetadata?.role !== 'admin') {
    redirect('/')
  }

  // Mock events data - replace with MongoDB query
  const events = [
    {
      id: '1',
      title: 'Summer Music Festival 2025',
      description: 'Join us for an amazing night of music.',
      date: '2025-07-15',
      venue: 'Central Park Amphitheater',
      location: 'New York, NY',
      price: 75,
      capacity: 1000,
      soldTickets: 485,
      status: 'PUBLISHED',
      createdAt: '2025-01-01T10:00:00Z'
    },
    {
      id: '2',
      title: 'Rock Concert Extravaganza',
      description: 'Experience the best rock bands live.',
      date: '2025-08-20',
      venue: 'Madison Square Garden',
      location: 'New York, NY',
      price: 65,
      capacity: 800,
      soldTickets: 320,
      status: 'PUBLISHED',
      createdAt: '2025-01-05T10:00:00Z'
    },
    {
      id: '3',
      title: 'Jazz Night Special',
      description: 'Smooth jazz under the stars.',
      date: '2025-09-10',
      venue: 'Blue Note Club',
      location: 'New York, NY',
      price: 45,
      capacity: 300,
      soldTickets: 0,
      status: 'DRAFT',
      createdAt: '2025-01-10T10:00:00Z'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
            <p className="mt-2 text-gray-600">Manage all events and their details</p>
          </div>
          <Link
            href="/admin/events/create"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Event
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.status === 'PUBLISHED').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tickets Sold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.reduce((sum, e) => sum + e.soldTickets, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${events.reduce((sum, e) => sum + (e.soldTickets * e.price), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Events</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{new Date(event.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{event.venue}</div>
                        <div className="text-sm text-gray-500">{event.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{event.soldTickets} / {event.capacity}</div>
                        <div className="text-sm text-gray-500">
                          {Math.round((event.soldTickets / event.capacity) * 100)}% sold
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${(event.soldTickets * event.price).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">${event.price} per ticket</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        event.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/events/${event.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="View Event"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded"
                          title="Edit Event"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}