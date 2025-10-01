'use client'

import { useState } from 'react'
import { generateTicketWithQR } from '@/lib/qr-generator'
import { toast } from 'react-hot-toast'
import { Ticket, Download, Smartphone, Mail, CheckCircle } from 'lucide-react'

export default function TicketDemo() {
  const [generatedTicket, setGeneratedTicket] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generateDemoTicket = async () => {
    setLoading(true)
    try {
      const demoTicketData = {
        ticketId: `demo_${Date.now()}`,
        eventId: 'demo_event',
        eventTitle: 'Demo Concert',
        userId: 'demo_user',
        userEmail: 'demo@example.com',
        tierName: 'VIP',
        seatNumber: 'A-001',
        purchaseDate: new Date().toISOString(),
        eventDate: '2025-01-15',
        eventTime: '19:00',
        venue: 'Demo Arena',
        price: 89
      }

      const result = await generateTicketWithQR(demoTicketData)
      setGeneratedTicket(result)
      toast.success('Demo ticket generated!')
    } catch (error) {
      toast.error('Failed to generate demo ticket')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Ticket className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ticket Generation Demo</h2>
              <p className="text-gray-600">See how secure QR tickets are generated</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!generatedTicket ? (
            <div className="text-center">
              <div className="mb-6">
                <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Generate Demo Ticket
                </h3>
                <p className="text-gray-600 mb-6">
                  Click below to generate a demo ticket with crypto-signed QR code
                </p>
              </div>
              
              <button
                onClick={generateDemoTicket}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {loading ? 'Generating...' : 'Generate Demo Ticket'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Ticket Preview */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{generatedTicket.signedData.eventTitle}</h3>
                    <p className="opacity-90">{generatedTicket.signedData.venue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Date</p>
                    <p className="font-semibold">{generatedTicket.signedData.eventDate}</p>
                    <p className="font-semibold">{generatedTicket.signedData.eventTime}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm opacity-90">Seat</p>
                    <p className="text-lg font-bold">{generatedTicket.signedData.seatNumber}</p>
                    <p className="text-sm opacity-90">{generatedTicket.signedData.tierName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Price</p>
                    <p className="text-lg font-bold">{generatedTicket.signedData.price}€</p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Secure QR Code
                </h4>
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl shadow-lg">
                  <img 
                    src={generatedTicket.qrCodeImage} 
                    alt="Ticket QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Crypto-signed with HMAC for security
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-green-900">Crypto-Signed</h5>
                  <p className="text-sm text-green-700">HMAC signature prevents forgery</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-blue-900">Mobile Ready</h5>
                  <p className="text-sm text-blue-700">Apple Wallet & Google Pay</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <Mail className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-purple-900">Email Delivery</h5>
                  <p className="text-sm text-purple-700">Instant HTML email with QR</p>
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Technical Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Ticket ID:</p>
                    <p className="font-mono text-gray-900">{generatedTicket.signedData.ticketId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Signature:</p>
                    <p className="font-mono text-gray-900 truncate">{generatedTicket.signedData.signature}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Timestamp:</p>
                    <p className="font-mono text-gray-900">{new Date(generatedTicket.signedData.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expires:</p>
                    <p className="font-mono text-gray-900">{new Date(generatedTicket.signedData.expiryDate).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setGeneratedTicket(null)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Generate Another
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(generatedTicket.signedData))}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy QR Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}