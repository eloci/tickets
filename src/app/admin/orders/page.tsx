import Header from '@/components/Header'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ShoppingBag, DollarSign, Eye, Download, CheckCircle, Clock } from 'lucide-react'

export default async function AdminOrdersPage() {
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

  // Mock orders data - replace with MongoDB query
  const orders = [
    {
      id: 'order_1',
      userId: 'user_123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      eventId: '1',
      eventTitle: 'Summer Music Festival 2025',
      eventDate: '2025-07-15',
      totalAmount: 150,
      status: 'CONFIRMED',
      orderDate: '2025-01-10T10:00:00Z',
      tickets: [
        { id: 'ticket_1', ticketType: 'General Admission', price: 75 },
        { id: 'ticket_2', ticketType: 'General Admission', price: 75 }
      ]
    },
    {
      id: 'order_2',
      userId: 'user_456',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      eventId: '2',
      eventTitle: 'Rock Concert Extravaganza',
      eventDate: '2025-08-20',
      totalAmount: 130,
      status: 'PENDING',
      orderDate: '2025-01-12T14:30:00Z',
      tickets: [
        { id: 'ticket_3', ticketType: 'VIP', price: 65 },
        { id: 'ticket_4', ticketType: 'VIP', price: 65 }
      ]
    },
    {
      id: 'order_3',
      userId: 'user_789',
      userName: 'Bob Johnson',
      userEmail: 'bob@example.com',
      eventId: '1',
      eventTitle: 'Summer Music Festival 2025',
      eventDate: '2025-07-15',
      totalAmount: 45,
      status: 'CANCELLED',
      orderDate: '2025-01-08T09:15:00Z',
      tickets: [
        { id: 'ticket_5', ticketType: 'Early Bird', price: 45 }
      ]
    }
  ]

  const totalOrders = orders.length
  const confirmedOrders = orders.filter(order => order.status === 'CONFIRMED')
  const pendingOrders = orders.filter(order => order.status === 'PENDING')
  const totalRevenue = confirmedOrders.reduce((sum, order) => sum + order.totalAmount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="mt-2 text-gray-600">Track and manage all customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{confirmedOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()}€</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.tickets.length} ticket{order.tickets.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.userName}
                        </div>
                        <div className="text-sm text-gray-500">{order.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.eventTitle}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.eventDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.totalAmount.toFixed(2)}€
                      </div>
                      <div className="text-sm text-gray-500">
                        {(order.totalAmount / order.tickets.length).toFixed(2)}€ per ticket
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="View Order Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
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