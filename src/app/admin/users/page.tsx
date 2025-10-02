import Header from '@/components/Header'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <Users className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Users Management</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl p-6">
          <div className="text-center text-white">
            <p>User management functionality is coming soon.</p>
            <p className="text-gray-300 mt-2">This section will allow you to manage user accounts, roles, and permissions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}