'use client'

import { useUser } from '@/lib/use-user'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Edit,
  Ticket,
  CreditCard,
  Bell,
  Settings,
  Eye,
  Download,
  Smartphone,
  TrendingUp,
  Heart,
  Share2,
  Filter,
  Search
} from 'lucide-react'

interface Order {
  id: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venue: string
  totalAmount: number
  currency: string
  status: 'confirmed' | 'pending' | 'cancelled'
  ticketsCount: number
  purchaseDate: string
  eventImage?: string
}

interface UserStats {
  totalOrders: number
  totalTickets: number
  totalSpent: number
  upcomingEvents: number
  favoriteVenue: string
  memberSince: string
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState('overview')
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch real data from API
  useEffect(() => {
    if (isLoaded && user) {  // Restore user requirement for real data
      const fetchData = async () => {
        try {
          // Fetch user stats
          const statsResponse = await fetch('/api/profile/stats', { cache: 'no-store' })
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            setStats(statsData)
          }

          // Fetch recent orders
          const ordersResponse = await fetch('/api/orders?limit=3', { cache: 'no-store' })
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json()
            // Ensure ordersData is an array before slicing
            setOrders(Array.isArray(ordersData) ? ordersData.slice(0, 3) : []) // Limit to 3 for overview
          }
        } catch (error) {
          console.error('Error fetching profile data:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    } else if (isLoaded) {
      // If loaded but no user, stop loading
      setLoading(false)
    }
  }, [isLoaded, user])  // Restore user dependency

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-white text-xl">Loading your profile...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-white text-xl">Please sign in to view your profile</div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Removed dev-only seed button and logic; profile relies solely on real data

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user.fullName || `${user.firstName} ${user.lastName}` || 'User'}
                </h1>
                <p className="text-white/70 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.emailAddresses?.[0]?.emailAddress}
                </p>
                <p className="text-white/70 flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member since {stats?.memberSince}
                </p>
              </div>
            </div>
            <Link
              href="/profile/edit"
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Tickets</p>
                  <p className="text-2xl font-bold text-white">{stats.totalTickets}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-white">${stats.totalSpent.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Upcoming Events</p>
                  <p className="text-2xl font-bold text-white">{stats.upcomingEvents}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'orders', label: 'My Orders', icon: Ticket },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Recent Orders</h3>
                <Link href="/profile/orders" className="text-purple-300 hover:text-purple-100 font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white truncate">{order.eventTitle}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span>{order.eventDate} • {order.venue}</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/events" className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-colors group">
                  <Calendar className="h-8 w-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white font-medium">Browse Events</p>
                </Link>
                <Link href="/profile/orders" className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-colors group">
                  <Ticket className="h-8 w-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white font-medium">My Tickets</p>
                </Link>
                <button className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-colors group">
                  <Heart className="h-8 w-8 text-pink-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white font-medium">Favorites</p>
                </button>
                <button className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-colors group">
                  <Share2 className="h-8 w-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white font-medium">Refer Friends</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white mb-4 md:mb-0">Order History</h3>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {(orders || []).map((order) => (
                <div key={order.id} className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                      {order.eventImage && (
                        <img
                          src={order.eventImage}
                          alt={order.eventTitle}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">{order.eventTitle}</h4>
                        <div className="flex items-center text-white/70 text-sm space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {order.eventDate} at {order.eventTime}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {order.venue}
                          </span>
                          <span className="flex items-center">
                            <Ticket className="h-4 w-4 mr-1" />
                            {order.ticketsCount} ticket{order.ticketsCount > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className="text-white/50 text-xs ml-4">
                            Purchased on {new Date(order.purchaseDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          {order.currency} ${order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          View Tickets
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Add to Wallet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Email Address</label>
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-white">{user.emailAddresses?.[0]?.emailAddress}</span>
                    <button className="text-purple-300 hover:text-purple-100 text-sm">Change</button>
                  </div>
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-white">••••••••</span>
                    <button className="text-purple-300 hover:text-purple-100 text-sm">Change</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Email Notifications</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">SMS Notifications</span>
                  <input type="checkbox" className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Marketing Emails</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Notifications</h3>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 flex items-start space-x-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">Order Confirmation</p>
                  <p className="text-white/70 text-sm">Your order for Rock Concert 2025 has been confirmed</p>
                  <p className="text-white/50 text-xs mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 flex items-start space-x-4">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">Ticket Email Sent</p>
                  <p className="text-white/70 text-sm">Your tickets have been sent to your email address</p>
                  <p className="text-white/50 text-xs mt-1">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}