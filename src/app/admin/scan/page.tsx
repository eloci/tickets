import { requireAdmin } from '@/lib/clerk-auth'
import Link from 'next/link'
import { ArrowLeft, QrCode } from 'lucide-react'
import { QRScanner } from '@/components/admin'

export default async function AdminScanPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
                <h1 className="text-3xl font-bold text-gray-900">🎫 QR Ticket Scanner</h1>
                <p className="text-gray-600">Validate crypto-signed tickets with QR codes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feature Overview */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Advanced QR Validation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">🔒 Crypto-signed for security</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">⏰ Automatic expiry validation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">🛡️ Tamper-proof verification</span>
            </div>
          </div>
        </div>

        {/* QR Scanner Component */}
        <QRScanner />
      </div>
    </div>
  )
}