import Header from '@/components/Header'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Ticket, Download, Eye, CheckCircle } from 'lucide-react'

export default async function ProfileOrdersPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Mock orders data - replace with MongoDB query filtered by userId
  const orders = [
    {
      id: 'order_1',
      eventId: '1',
      eventTitle: 'Summer Music Festival 2025',
      eventDate: '2025-07-15',
      venue: 'Central Park Amphitheater',
      location: 'New York, NY',
      totalAmount: 150,
      status: 'CONFIRMED',
      orderDate: '2025-01-10T10:00:00Z',
      tickets: [
        { id: 'ticket_1', ticketType: 'General Admission', price: 75, qrCode: 'QR12345' },
        { id: 'ticket_2', ticketType: 'General Admission', price: 75, qrCode: 'QR67890' }
      ]
    },
    {
      id: 'order_2',
      eventId: '2',
      eventTitle: 'Rock Concert Extravaganza',
      eventDate: '2025-08-20',
      venue: 'Madison Square Garden',
      location: 'New York, NY',
      totalAmount: 130,
      status: 'PENDING',
      orderDate: '2025-01-12T14:30:00Z',
      tickets: [
        { id: 'ticket_3', ticketType: 'VIP', price: 65, qrCode: 'QR11111' },
        { id: 'ticket_4', ticketType: 'VIP', price: 65, qrCode: 'QR22222' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/profile"
              className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-600 mt-2">View and manage your ticket orders</p>
          </div>

          {/* Orders Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <Ticket className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter(o => o.status === 'CONFIRMED').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.reduce((sum, order) => sum + order.totalAmount, 0)}€
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{order.eventTitle}</h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(order.eventDate).toLocaleDateString()}</span>
                        <MapPin className="h-4 w-4 ml-4 mr-2" />
                        <span>{order.venue}, {order.location}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:text-right">
                      <div className="text-2xl font-bold text-gray-800">{order.totalAmount}€</div>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        order.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Details */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="font-medium text-gray-800">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-medium text-gray-800">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Tickets */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Tickets ({order.tickets.length})
                      </p>
                      <div className="space-y-2">
                        {order.tickets.map((ticket) => (
                          <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium text-gray-800">{ticket.ticketType}</span>
                              <span className="text-gray-600 ml-2">• {ticket.price}€</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">QR: {ticket.qrCode}</span>
                              <Link
                                href={`/tickets/${ticket.id}`}
                                className="text-purple-600 hover:text-purple-800"
                                title="View Ticket"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/events/${order.eventId}`}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Event
                      </Link>
                      
                      {order.status === 'CONFIRMED' && (
                        <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                          <Download className="h-4 w-4 mr-2" />
                          Download Tickets
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">You haven't purchased any tickets yet.</p>
              <Link
                href="/events"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse Events
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}