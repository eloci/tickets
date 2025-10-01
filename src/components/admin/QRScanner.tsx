'use client'

import { useState } from 'react'
import { validateQRCode, ValidationResult } from '@/lib/qr-generator'
import { toast } from 'react-hot-toast'
import { QrCode, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

export default function QRScanner() {
  const [scanResult, setScanResult] = useState<ValidationResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')

  const handleScan = async (qrData: string) => {
    setScanning(true)
    try {
      const result = validateQRCode(qrData)
      setScanResult(result)
      
      if (result.isValid && !result.isExpired) {
        toast.success('✅ Valid ticket!')
      } else if (result.isExpired) {
        toast.error('⏰ Ticket has expired')
      } else {
        toast.error('❌ Invalid ticket')
      }
    } catch (error) {
      toast.error('Error scanning ticket')
      console.error('Scan error:', error)
    } finally {
      setScanning(false)
    }
  }

  const handleManualScan = () => {
    if (!manualInput.trim()) {
      toast.error('Please enter QR code data')
      return
    }
    handleScan(manualInput)
  }

  const getStatusIcon = () => {
    if (!scanResult) return null
    
    if (scanResult.isValid && !scanResult.isExpired) {
      return <CheckCircle className="h-8 w-8 text-green-500" />
    } else if (scanResult.isExpired) {
      return <Clock className="h-8 w-8 text-yellow-500" />
    } else {
      return <XCircle className="h-8 w-8 text-red-500" />
    }
  }

  const getStatusColor = () => {
    if (!scanResult) return 'border-gray-300'
    
    if (scanResult.isValid && !scanResult.isExpired) {
      return 'border-green-500 bg-green-50'
    } else if (scanResult.isExpired) {
      return 'border-yellow-500 bg-yellow-50'
    } else {
      return 'border-red-500 bg-red-50'
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">QR Ticket Scanner</h2>
              <p className="text-gray-600">Scan or enter QR code data to validate tickets</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Manual Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manual QR Code Input
            </label>
            <div className="flex space-x-3">
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Paste QR code data here..."
                className="flex-1 min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleManualScan}
                disabled={scanning || !manualInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {scanning ? 'Scanning...' : 'Validate'}
              </button>
            </div>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div className={`border-2 rounded-xl p-6 ${getStatusColor()}`}>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getStatusIcon()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Scan Result
                    </h3>
                    {scanResult.isValid && !scanResult.isExpired && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        VALID
                      </span>
                    )}
                    {scanResult.isExpired && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        EXPIRED
                      </span>
                    )}
                    {!scanResult.isValid && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        INVALID
                      </span>
                    )}
                  </div>

                  {scanResult.error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-700 font-medium">Error:</span>
                      </div>
                      <p className="text-red-600 text-sm mt-1">{scanResult.error}</p>
                    </div>
                  )}

                  {scanResult.ticketData && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Ticket ID
                          </label>
                          <p className="text-sm font-mono text-gray-900">
                            {scanResult.ticketData.ticketId}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Event
                          </label>
                          <p className="text-sm text-gray-900">
                            {scanResult.ticketData.eventTitle}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Customer
                          </label>
                          <p className="text-sm text-gray-900">
                            {scanResult.ticketData.userEmail}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Seat
                          </label>
                          <p className="text-sm text-gray-900">
                            {scanResult.ticketData.seatNumber}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Event Date
                          </label>
                          <p className="text-sm text-gray-900">
                            {new Date(scanResult.ticketData.eventDate).toLocaleDateString()} at {scanResult.ticketData.eventTime}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Venue
                          </label>
                          <p className="text-sm text-gray-900">
                            {scanResult.ticketData.venue}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">How to use:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Paste the QR code data in the text area above</li>
              <li>• Click "Validate" to check the ticket</li>
              <li>• Green = Valid ticket, Yellow = Expired, Red = Invalid/Forged</li>
              <li>• All tickets are crypto-signed for security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}