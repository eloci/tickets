import { requireAdmin } from '@/lib/clerk-auth'
import connectDB from '@/lib/database'
import { Event, Order, Ticket, User } from '@/lib/schemas'
import Link from 'next/link'
import { Users, Calendar, Ticket as TicketIcon, DollarSign, Plus, Settings } from 'lucide-react'

export default async function AdminDashboard() {
  const user = await requireAdmin()
  
  // Mock data for now - replace with actual MongoDB queries
  const totalUsers = 0
  const totalEvents = 0 
  const totalOrders = 0
  const totalTickets = 0

  const totalRevenue = 0 // TODO: Calculate from orders
  const upcomingEvents = 0 // TODO: Count upcoming events
  const recentEvents = [] // TODO: Fetch recent events
  const recentOrders = [] // TODO: Fetch recent orders

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session.user.name}</p>
            </div>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Back to Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                <p className="text-xs text-gray-500">
                  {usersByRole.find(r => r.role === 'ADMIN')?._count.role || 0} Admins, {' '}
                  {usersByRole.find(r => r.role === 'USER')?._count.role || 0} Users
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                <p className="text-xs text-gray-500">{upcomingEvents} upcoming</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Ticket className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                <p className="text-xs text-gray-500">{totalTickets} tickets sold</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">From {confirmedOrders.length} confirmed orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-indigo-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents}</p>
                <p className="text-xs text-gray-500">Published & future</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/events/create"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2 text-gray-500" />
              <span className="text-gray-700">Create Event</span>
            </Link>

            <Link
              href="/admin/events"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              <span className="text-gray-700">Manage Events</span>
            </Link>

            <Link
              href="/admin/content/homepage"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <Settings className="h-5 w-5 mr-2 text-gray-500" />
              <span className="text-gray-700">Homepage Content</span>
            </Link>



            <Link
              href="/admin/content/past-events"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              <span className="text-gray-700">Past Events</span>
            </Link>

            <Link
              href="/admin/scan"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
            >
              <Ticket className="h-5 w-5 mr-2 text-gray-500" />
              <span className="text-gray-700">Scan QR Codes</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
            >
              <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
              <span className="text-gray-700">View Orders</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
            >
              <Users className="h-5 w-5 mr-2 text-gray-500" />
              <span className="text-gray-700">Manage Users</span>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              <span className="text-gray-700">Analytics</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Events */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
              <Link
                href="/admin/events"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                  <div>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()} • {event.venue}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                    event.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {event.status}
                  </span>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className="text-gray-500 text-center py-4">No events yet</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                  <div>
                    <h3 className="font-medium text-gray-900">{order.event.title}</h3>
                    <p className="text-sm text-gray-600">{order.user.name || order.user.email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}