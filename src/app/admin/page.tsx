'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Settings, Calendar, Ticket as TicketIcon, DollarSign, Users, BarChart3, TrendingUp } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalEvents: number
  totalOrders: number
  totalTickets: number
  totalRevenue: number
  upcomingEvents: number
}

interface RecentEvent {
  id: string
  title: string
  date: string
  venue: string
  status: string
}

interface RecentOrder {
  id: string
  event: { title: string }
  user: { name: string; email: string }
  total: number
  status: string
  createdAt: string
}

interface DashboardData {
  stats: DashboardStats
  recentEvents: RecentEvent[]
  recentOrders: RecentOrder[]
}

export default function AdminDashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata?.role !== 'admin')) {
      router.push('/sign-in')
      return
    }

    if (isLoaded && user && user.publicMetadata?.role === 'admin') {
      fetchDashboardData()
    }
  }, [user, isLoaded, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.publicMetadata?.role !== 'admin') {
    return null // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
          <p className="text-white text-lg">Error loading dashboard: {error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  const { stats, recentEvents, recentOrders } = dashboardData

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 -z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Admin
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  {' '}Dashboard
                </span>
              </h1>
              <p className="text-xl text-gray-200">Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0]}</p>
            </div>
            <Link
              href="/"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg"
            >
              Back to Site
            </Link>
          </div>
        </div>
      </div>

      <div className="relative -mt-8 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <Users className="h-10 w-10 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Users</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                    <span className="text-xs text-green-400">+12% this month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <Calendar className="h-10 w-10 text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Events</p>
                  <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
                  <p className="text-xs text-gray-400">{stats.upcomingEvents} upcoming</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <TicketIcon className="h-10 w-10 text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Orders</p>
                  <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
                  <p className="text-xs text-gray-400">{stats.totalTickets} tickets sold</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <DollarSign className="h-10 w-10 text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}€</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                    <span className="text-xs text-green-400">+8% this month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <Calendar className="h-10 w-10 text-indigo-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Upcoming Events</p>
                  <p className="text-3xl font-bold text-white">{stats.upcomingEvents}</p>
                  <p className="text-xs text-gray-400">Published & future</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center">
                <TicketIcon className="h-10 w-10 text-pink-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Tickets Sold</p>
                  <p className="text-3xl font-bold text-white">{stats.totalTickets}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                    <span className="text-xs text-green-400">+15% this week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Recent Events */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Events</h2>
                <Link
                  href="/admin/events"
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event) => (
                    <div key={event.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
                      <div>
                        <h3 className="font-medium text-white">{event.title}</h3>
                        <p className="text-sm text-gray-300">
                          {new Date(event.date).toLocaleDateString()} • {event.venue}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium border ${event.status === 'PUBLISHED' ? 'bg-green-400 bg-opacity-20 text-green-300 border-green-400' :
                          event.status === 'DRAFT' ? 'bg-yellow-400 bg-opacity-20 text-yellow-300 border-yellow-400' :
                            'bg-red-400 bg-opacity-20 text-red-300 border-red-400'
                        }`}>
                        {event.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-300">No events created yet</p>
                    <Link
                      href="/admin/events/create"
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                    >
                      Create your first event →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
                <Link
                  href="/admin/orders"
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
                      <div>
                        <h3 className="font-medium text-white">{order.event.title}</h3>
                        <p className="text-sm text-gray-300">{order.user.name || order.user.email}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">{order.total.toFixed(2)}€</p>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium border ${order.status === 'CONFIRMED' ? 'bg-green-400 bg-opacity-20 text-green-300 border-green-400' :
                            order.status === 'PENDING' ? 'bg-yellow-400 bg-opacity-20 text-yellow-300 border-yellow-400' :
                              'bg-red-400 bg-opacity-20 text-red-300 border-red-400'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-300">No orders yet</p>
                    <p className="text-sm text-gray-400 mt-1">Orders will appear here when users book tickets</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-8">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/admin/events/create"
                className="flex items-center justify-center p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-pink-400 hover:bg-white/10 transition-all duration-300 group transform hover:scale-105"
              >
                <Plus className="h-6 w-6 mr-3 text-gray-400 group-hover:text-pink-400" />
                <span className="text-gray-300 group-hover:text-white font-medium">Create Event</span>
              </Link>

              <Link
                href="/admin/events"
                className="flex items-center justify-center p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-green-400 hover:bg-white/10 transition-all duration-300 group transform hover:scale-105"
              >
                <Calendar className="h-6 w-6 mr-3 text-gray-400 group-hover:text-green-400" />
                <span className="text-gray-300 group-hover:text-white font-medium">Manage Events</span>
              </Link>

              <Link
                href="/admin/orders"
                className="flex items-center justify-center p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-purple-400 hover:bg-white/10 transition-all duration-300 group transform hover:scale-105"
              >
                <DollarSign className="h-6 w-6 mr-3 text-gray-400 group-hover:text-purple-400" />
                <span className="text-gray-300 group-hover:text-white font-medium">View Orders</span>
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center justify-center p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-blue-400 hover:bg-white/10 transition-all duration-300 group transform hover:scale-105"
              >
                <Users className="h-6 w-6 mr-3 text-gray-400 group-hover:text-blue-400" />
                <span className="text-gray-300 group-hover:text-white font-medium">Manage Users</span>
              </Link>

              <Link
                href="/admin/scan"
                className="flex items-center justify-center p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-yellow-400 hover:bg-white/10 transition-all duration-300 group transform hover:scale-105"
              >
                <TicketIcon className="h-6 w-6 mr-3 text-gray-400 group-hover:text-yellow-400" />
                <span className="text-gray-300 group-hover:text-white font-medium">Scan QR Codes</span>
              </Link>

              <Link
                href="/admin/analytics"
                className="flex items-center justify-center p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-orange-400 hover:bg-white/10 transition-all duration-300 group transform hover:scale-105"
              >
                <BarChart3 className="h-6 w-6 mr-3 text-gray-400 group-hover:text-orange-400" />
                <span className="text-gray-300 group-hover:text-white font-medium">Analytics</span>
              </Link>

              <Link
                href="/admin/content/homepage"
                className="flex items-center justify-center p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-indigo-400 hover:bg-white/10 transition-all duration-300 group transform hover:scale-105"
              >
                <Settings className="h-6 w-6 mr-3 text-gray-400 group-hover:text-indigo-400" />
                <span className="text-gray-300 group-hover:text-white font-medium">Homepage Content</span>
              </Link>

              <Link
                href="/admin/content/past-events"
                className="flex items-center justify-center p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-pink-400 hover:bg-white/10 transition-all duration-300 group transform hover:scale-105"
              >
                <Calendar className="h-6 w-6 mr-3 text-gray-400 group-hover:text-pink-400" />
                <span className="text-gray-300 group-hover:text-white font-medium">Past Events</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}