import { requireAdmin } from '@/lib/clerk-auth'
import Link from 'next/link'
import { ArrowLeft, BarChart3, TrendingUp } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const user = await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">View detailed analytics and reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <BarChart3 className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
          <p className="text-gray-600 mb-8">
            This feature will provide detailed analytics including sales trends, popular events, user engagement, and revenue insights.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-700">
              <strong>Coming Soon:</strong> Interactive charts, revenue reports, event performance metrics, and user analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}