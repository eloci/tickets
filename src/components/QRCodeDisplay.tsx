'use client'

import { useState, useEffect } from 'react'
import { QrCode } from 'lucide-react'
import Image from 'next/image'

interface QRCodeDisplayProps {
  ticketId: string
  categoryName: string
  ticketNumber: string
  price: number
}

export function QRCodeDisplay({ ticketId, categoryName, ticketNumber, price }: QRCodeDisplayProps) {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await fetch(`/api/tickets/${ticketId}/qr`)
        if (response.ok) {
          const data = await response.json()
          setQrCodeImage(data.qrCodeImage)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Error fetching QR code:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchQRCode()
  }, [ticketId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-lg p-4 text-center">
      <div className="bg-gray-100 w-32 h-32 mx-auto mb-3 flex items-center justify-center rounded-lg">
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        ) : error || !qrCodeImage ? (
          <QrCode className="h-16 w-16 text-gray-400" />
        ) : (
          <Image
            src={qrCodeImage}
            alt={`QR Code for ${categoryName} ticket`}
            width={120}
            height={120}
            className="rounded"
          />
        )}
      </div>
      <p className="text-sm font-medium text-gray-900">{categoryName}</p>
      <p className="text-xs text-gray-600">#{ticketNumber}</p>
      <p className="text-xs text-gray-600 mt-1">{formatCurrency(price)}</p>
    </div>
  )
}