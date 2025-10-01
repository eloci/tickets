'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  description?: string | null
  price: any // Handle Decimal type from Prisma
  maxQuantity: number
  available: number
}

interface TicketSelectorProps {
  eventId: string
  categories: Category[]
}

interface TicketSelection {
  [categoryId: string]: number
}

export default function TicketSelector({ eventId, categories }: TicketSelectorProps) {
  const [selectedTickets, setSelectedTickets] = useState<TicketSelection>({})
  const [loading, setLoading] = useState(false)
  const { user } = useUser()
  const router = useRouter()

  const updateTicketQuantity = (categoryId: string, change: number) => {
    setSelectedTickets(prev => {
      const current = prev[categoryId] || 0
      const newQuantity = Math.max(0, current + change)
      const category = categories.find(c => c.id === categoryId)
      const maxQuantity = category ? Math.min(category.available, 10) : 0

      return {
        ...prev,
        [categoryId]: Math.min(newQuantity, maxQuantity)
      }
    })
  }

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [categoryId, quantity]) => {
      const category = categories.find(c => c.id === categoryId)
      return total + (category ? Number(category.price) * quantity : 0)
    }, 0)
  }

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0)
  }

  const handleCheckout = async () => {
    if (!user) {
      router.push('/sign-in')
      return
    }

    const totalTickets = getTotalTickets()
    if (totalTickets === 0) {
      toast.error('Please select at least one ticket')
      return
    }

    setLoading(true)

    try {
      // Create order first
      const orderItems = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([categoryId, quantity]) => ({
          categoryId,
          quantity
        }))

      const orderResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          items: orderItems
        })
      })

      if (!orderResponse.ok) {
        const error = await orderResponse.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const { orderId } = await orderResponse.json()

      // Create Stripe checkout session
      const stripeResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId })
      })

      if (!stripeResponse.ok) {
        const error = await stripeResponse.json()

        // Handle Stripe not configured (development mode)
        if (stripeResponse.status === 503 && error.development) {
          console.warn('Stripe not configured, using mock payment system')

          // Use mock payment system for development
          const mockResponse = await fetch('/api/mock-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId })
          })

          if (!mockResponse.ok) {
            const mockError = await mockResponse.json()
            throw new Error(mockError.error || 'Mock payment failed')
          }

          toast.success('🎫 Payment completed successfully! (Development Mode)')
          router.push(`/orders/${orderId}/confirmation`)
          return
        }

        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { sessionId } = await stripeResponse.json()

      // Redirect to Stripe Checkout - TODO: Implement proper Stripe redirect
      window.location.href = `/checkout/${sessionId}`
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 sticky top-8">
      <h3 className="text-2xl font-bold text-white mb-6">Select Tickets</h3>

      <div className="space-y-4">
        {categories.map((category) => {
          const quantity = selectedTickets[category.id] || 0
          return (
            <div key={category.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-white">{category.name}</h4>
                  {category.description && (
                    <p className="text-sm text-gray-300 mt-1">{category.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{Number(category.price).toFixed(2)}€</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-300">
                  {category.available} available
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateTicketQuantity(category.id, -1)}
                    disabled={quantity === 0}
                    className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-white">{quantity}</span>
                  <button
                    onClick={() => updateTicketQuantity(category.id, 1)}
                    disabled={quantity >= Math.min(category.available, 10)}
                    className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-white">Total</span>
          <span className="text-2xl font-bold text-white">{getTotalPrice().toFixed(2)}€</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading || getTotalTickets() === 0}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Processing...' : 'Proceed to Checkout'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Secure checkout with SSL encryption
        </p>
      </div>
    </div>
  )
}