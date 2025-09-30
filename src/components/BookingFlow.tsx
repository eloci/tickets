'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ShoppingCartIcon, MinusIcon, PlusIcon } from 'lucide-react'

interface Event {
  id: string
  title: string
  description?: string
  venue: string
  address: string
  city: string
  country: string
  date: Date
  doors: Date
  startTime: Date
  endTime?: Date
  image?: string
  categories: {
    id: string
    name: string
    description?: string
    price: string
    available: number
    maxQuantity: number
    color: string
  }[]
}

interface CartItem {
  categoryId: string
  categoryName: string
  price: number
  quantity: number
  maxQuantity: number
}

interface BookingFlowProps {
  event: Event
}

export default function BookingFlow({ event }: BookingFlowProps) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const addToCart = (category: Event['categories'][0]) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.categoryId === category.id)

      if (existingItem) {
        if (existingItem.quantity < category.maxQuantity && existingItem.quantity < category.available) {
          return prevCart.map(item =>
            item.categoryId === category.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        } else {
          toast.error(`Maximum ${category.maxQuantity} tickets per category`)
          return prevCart
        }
      } else {
        return [...prevCart, {
          categoryId: category.id,
          categoryName: category.name,
          price: parseFloat(category.price),
          quantity: 1,
          maxQuantity: category.maxQuantity
        }]
      }
    })
  }

  const removeFromCart = (categoryId: string) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.categoryId === categoryId) {
          const newQuantity = item.quantity - 1
          if (newQuantity <= 0) {
            return null
          }
          return { ...item, quantity: newQuantity }
        }
        return item
      }).filter(Boolean) as CartItem[]
    })
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Please add tickets to your cart')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          items: cart.map(item => ({
            categoryId: item.categoryId,
            quantity: item.quantity
          }))
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to checkout page
        router.push(`/checkout/${data.orderId}`)
      } else {
        throw new Error(data.error || 'Failed to create order')
      }
    } catch (error) {
      toast.error('Failed to proceed to checkout')
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Event Header */}
      <div className="mb-8">
        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        )}
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <p className="text-gray-600 mb-2">{event.venue} • {event.city}, {event.country}</p>
        <p className="text-gray-600 mb-2">{event.address}</p>
        <p className="text-gray-600">
          {new Date(event.date).toLocaleDateString()} •
          Doors: {new Date(event.doors).toLocaleTimeString()} •
          Show: {new Date(event.startTime).toLocaleTimeString()}
        </p>
        {event.description && (
          <p className="text-gray-700 mt-4">{event.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket Categories */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Select Tickets</h2>

          <div className="space-y-4">
            {event.categories.map((category) => {
              const cartItem = cart.find(item => item.categoryId === category.id)
              const quantity = cartItem?.quantity || 0
              const isUnavailable = category.available <= 0

              return (
                <div
                  key={category.id}
                  className={`border rounded-lg p-4 ${isUnavailable ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: category.color }}>
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm">{category.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {category.available} tickets available • Max {category.maxQuantity} per order
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">${category.price}</p>
                    </div>
                  </div>

                  {!isUnavailable && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => removeFromCart(category.id)}
                          disabled={quantity === 0}
                          className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => addToCart(category)}
                          disabled={quantity >= category.maxQuantity || quantity >= category.available}
                          className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => addToCart(category)}
                        disabled={quantity >= category.maxQuantity || quantity >= category.available}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add to Cart
                      </button>
                    </div>
                  )}

                  {isUnavailable && (
                    <div className="text-center py-2">
                      <span className="text-red-600 font-medium">Sold Out</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Cart ({getCartItemCount()})
            </h3>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.categoryId} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.categoryName}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}