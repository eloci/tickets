'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Download, Mail, Smartphone, Ticket, Calendar, MapPin } from 'lucide-react'
import Header from '@/components/Header'

export default function PaymentSuccess() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      // In a real implementation, you'd fetch session details from your API
      // For now, we'll show a success message
      setSessionData({
        id: sessionId,
        eventTitle: 'Your Event',
        customerEmail: 'customer@example.com',
        totalAmount: 89
      })
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-8">
            <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Payment Successful! 🎉</h1>
            <p className="text-xl text-white/80 mb-8">
              Your tickets have been purchased successfully
            </p>
          </div>

          {/* Event Info */}
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-300/30 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">🎫 Ticket Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
              <div className="flex items-center justify-center space-x-2">
                <Ticket className="h-5 w-5 text-pink-400" />
                <span>Session: {sessionId?.substring(0, 8)}...</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Mail className="h-5 w-5 text-pink-400" />
                <span>Email Sent</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Smartphone className="h-5 w-5 text-pink-400" />
                <span>Wallet Ready</span>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">📧 Email Delivered</h3>
              <p className="text-white/70 text-sm">
                Your tickets with QR codes have been sent to your email address instantly
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">📱 Mobile Wallet</h3>
              <p className="text-white/70 text-sm">
                Add your tickets to Apple Wallet or Google Pay using the links in your email
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">🔒 Secure QR Codes</h3>
              <p className="text-white/70 text-sm">
                Your tickets are protected with crypto-signed QR codes for maximum security
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">💳 Stripe Powered</h3>
              <p className="text-white/70 text-sm">
                Your payment was processed securely through Stripe's trusted payment platform
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-yellow-300 mb-3">📋 Next Steps</h3>
            <div className="text-white/80 text-left space-y-2">
              <p>✅ Check your email for the ticket confirmation</p>
              <p>✅ Add tickets to your mobile wallet for easy access</p>
              <p>✅ Present the QR code at the venue entrance</p>
              <p>✅ Arrive 30 minutes early to avoid queues</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Browse More Events
            </Link>
            <Link
              href="/"
              className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200"
            >
              Back to Home
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm">
              Need help? Contact our support team or check your email for detailed ticket information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}