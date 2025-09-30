'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { SmartphoneIcon, DownloadIcon } from 'lucide-react'

interface Ticket {
  id: string
  ticketNumber: string
  qrCode: string
  category: {
    name: string
    price: string
  }
}

interface WalletButtonsProps {
  ticket: Ticket
  eventTitle: string
}

export default function WalletButtons({ ticket, eventTitle }: WalletButtonsProps) {
  const [loading, setLoading] = useState<string>('')

  const addToAppleWallet = async () => {
    setLoading('apple')

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/wallet/apple`)

      if (response.ok) {
        const passData = await response.blob()
        const url = URL.createObjectURL(passData)

        // Create download link
        const a = document.createElement('a')
        a.href = url
        a.download = `${ticket.ticketNumber}.pkpass`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('Apple Wallet pass downloaded!')
      } else {
        throw new Error('Failed to generate Apple Wallet pass')
      }
    } catch (error) {
      console.error('Apple Wallet error:', error)
      toast.error('Failed to add to Apple Wallet')
    } finally {
      setLoading('')
    }
  }

  const addToGooglePay = async () => {
    setLoading('google')

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/wallet/google`)

      if (response.ok) {
        const { saveUrl } = await response.json()

        // Open Google Pay save URL in new window
        window.open(saveUrl, '_blank', 'width=600,height=600')

        toast.success('Opening Google Pay...')
      } else {
        throw new Error('Failed to generate Google Pay pass')
      }
    } catch (error) {
      console.error('Google Pay error:', error)
      toast.error('Failed to add to Google Pay')
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="flex space-x-3 mt-4">
      <button
        onClick={addToAppleWallet}
        disabled={loading === 'apple'}
        className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'apple' ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <SmartphoneIcon className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">Add to Apple Wallet</span>
      </button>

      <button
        onClick={addToGooglePay}
        disabled={loading === 'google'}
        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'google' ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <DownloadIcon className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">Add to Google Pay</span>
      </button>
    </div>
  )
}