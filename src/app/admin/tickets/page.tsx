import Header from '@/components/Header'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Ticket, QrCode, CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react'

export default async function AdminTicketsPage() {
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

  // Mock tickets data - replace with MongoDB query
  const tickets = [
    {
      id: 'ticket_1',
      orderId: 'order_1',
      eventId: '1',
      eventTitle: 'Summer Music Festival 2025',
      eventDate: '2025-07-15',
      userId: 'user_123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      ticketType: 'General Admission',
      price: 75,
      status: 'PURCHASED',
      qrCode: 'QR12345ABCDE',
      purchaseDate: '2025-01-10T10:00:00Z',
      usedAt: null
    },
    {
      id: 'ticket_2',
      orderId: 'order_1',
      eventId: '1',
      eventTitle: 'Summer Music Festival 2025',
      eventDate: '2025-07-15',
      userId: 'user_123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      ticketType: 'General Admission',
      price: 75,
      status: 'USED',
      qrCode: 'QR67890FGHIJ',
      purchaseDate: '2025-01-10T10:00:00Z',
      usedAt: '2025-07-15T18:30:00Z'
    },
    {
      id: 'ticket_3',
      orderId: 'order_2',
      eventId: '2',
      eventTitle: 'Rock Concert Extravaganza',
      eventDate: '2025-08-20',
      userId: 'user_456',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      ticketType: 'VIP',
      price: 65,
      status: 'PURCHASED',
      qrCode: 'QR11111KLMNO',
      purchaseDate: '2025-01-12T14:30:00Z',
      usedAt: null
    },
    {
      id: 'ticket_4',
      orderId: 'order_3',
      eventId: '1',
      eventTitle: 'Summer Music Festival 2025',
      eventDate: '2025-07-15',
      userId: 'user_789',
      userName: 'Bob Johnson',
      userEmail: 'bob@example.com',
      ticketType: 'Early Bird',
      price: 45,
      status: 'CANCELLED',
      qrCode: 'QR22222PQRST',
      purchaseDate: '2025-01-08T09:15:00Z',
      usedAt: null
    }
  ]

  const totalTickets = tickets.length
  const purchasedTickets = tickets.filter(t => t.status === 'PURCHASED')
  const usedTickets = tickets.filter(t => t.status === 'USED')
  const cancelledTickets = tickets.filter(t => t.status === 'CANCELLED')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tickets Management</h1>
          <p className="mt-2 text-gray-600">Track and manage all event tickets</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Ticket className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valid Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{purchasedTickets.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <QrCode className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Used Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{usedTickets.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{cancelledTickets.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Tickets</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        QR: {ticket.qrCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.userName}
                          </div>
                          <div className="text-sm text-gray-500">{ticket.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ticket.eventTitle}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(ticket.eventDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ticket.ticketType}</div>
                        <div className="text-sm text-gray-500">${ticket.price}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ticket.status === 'PURCHASED'
                          ? 'bg-green-100 text-green-800'
                          : ticket.status === 'USED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ticket.status}
                      </span>
                      {ticket.usedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Used: {new Date(ticket.usedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="View QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button
                          className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded"
                          title="View Details"
                        >
                          <User className="h-4 w-4" />
                        </button>
                        {ticket.status === 'PURCHASED' && (
                          <button
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                            title="Mark as Used"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
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