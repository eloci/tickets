'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

// Define types for our models
interface Event {
  id: string
  title: string
  description?: string
  venue: string
  address: string
  date: Date
  image?: string
  posterUrl?: string
  youtubeUrl?: string
  capacity: number
  status: string
  organizerId: string
  createdAt: Date
  updatedAt: Date
}

interface Category {
  id: string
  name: string
  description?: string
  color: string
  price: number
  maxQuantity: number
  available: number
  eventId: string
  createdAt: Date
  updatedAt: Date
}

interface EventWithCategories extends Event {
  categories: Category[]
}

interface EventFormData {
  title: string
  description: string
  venue: string
  address: string
  date: string
  capacity: number
  image: string
  posterUrl: string
  youtubeUrl: string
  categories: {
    id?: string
    name: string
    description: string
    price: number
    capacity: number
  }[]
}

interface EventFormProps {
  initialData?: EventWithCategories
  isEditing?: boolean
}

export default function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [posterUploading, setPosterUploading] = useState(false)

  // Convert initial data or use defaults
  const getInitialFormData = (): EventFormData => {
    if (initialData) {
      return {
        title: initialData.title,
        description: initialData.description || '',
        venue: initialData.venue,
        address: initialData.address,
        date: new Date(initialData.date).toISOString().slice(0, 16), // Format for datetime-local input
        capacity: initialData.capacity,
        image: initialData.image || '',
        posterUrl: initialData.posterUrl || '',
        youtubeUrl: initialData.youtubeUrl || '',
        categories: initialData.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          price: Number(cat.price),
          capacity: cat.available // Use available field for capacity in edit mode
        }))
      }
    }

    return {
      title: '',
      description: '',
      venue: '',
      address: '',
      date: '',
      capacity: 1000,
      image: '',
      posterUrl: '',
      youtubeUrl: '',
      categories: [
        {
          name: 'General Admission',
          description: 'Standing room only',
          price: 50,
          capacity: 800
        },
        {
          name: 'VIP',
          description: 'Premium seating with perks',
          price: 150,
          capacity: 200
        }
      ]
    }
  }

  const [formData, setFormData] = useState<EventFormData>(getInitialFormData())

  // Image upload handler
  const handleImageUpload = async (file: File, type: 'image' | 'poster') => {
    if (type === 'image') setImageUploading(true)
    if (type === 'poster') setPosterUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('files', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      const uploadedUrl = result.files[0]

      if (type === 'image') {
        setFormData({ ...formData, image: uploadedUrl })
        toast.success('Event image uploaded successfully!')
      } else {
        setFormData({ ...formData, posterUrl: uploadedUrl })
        toast.success('Poster image uploaded successfully!')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      if (type === 'image') setImageUploading(false)
      if (type === 'poster') setPosterUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing
        ? `/api/admin/events/${initialData?.id}`
        : '/api/admin/events'

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(isEditing ? 'Event updated successfully!' : 'Event created successfully!')
        router.push('/admin/events')
      } else {
        toast.error(result.error || `Failed to ${isEditing ? 'update' : 'create'} event`)
        console.error('Error:', result)
      }
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} event`)
      console.error('Network error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      })
    } finally {
      setLoading(false)
    }
  }

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [
        ...formData.categories,
        {
          name: '',
          description: '',
          price: 0,
          capacity: 0
        }
      ]
    })
  }

  const updateCategory = (index: number, field: string, value: any) => {
    const updatedCategories = [...formData.categories]
    updatedCategories[index] = { ...updatedCategories[index], [field]: value }
    setFormData({ ...formData, categories: updatedCategories })
  }

  const removeCategory = (index: number) => {
    const updatedCategories = formData.categories.filter((_, i) => i !== index)
    setFormData({ ...formData, categories: updatedCategories })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </h1>
            <Link
              href="/admin/events"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Events
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Event Details */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Event Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Concert Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Venue *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Venue Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Venue Address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Total Capacity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Event Image
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'image')
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={imageUploading}
                  />
                  {imageUploading && (
                    <div className="text-sm text-blue-600">Uploading image...</div>
                  )}
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={formData.image} 
                        alt="Event preview" 
                        className="w-32 h-20 object-cover rounded border"
                      />
                      <div className="text-xs text-gray-500 mt-1">{formData.image}</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Poster Image
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'poster')
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    disabled={posterUploading}
                  />
                  {posterUploading && (
                    <div className="text-sm text-purple-600">Uploading poster...</div>
                  )}
                  {formData.posterUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.posterUrl} 
                        alt="Poster preview" 
                        className="w-32 h-20 object-cover rounded border"
                      />
                      <div className="text-xs text-gray-500 mt-1">{formData.posterUrl}</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  YouTube Video URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description..."
                />
              </div>
            </div>
          </div>

          {/* Ticket Categories */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Ticket Categories</h2>
              <button
                type="button"
                onClick={addCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Category
              </button>
            </div>

            <div className="space-y-4">
              {formData.categories.map((category, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Category {index + 1}</h3>
                    {formData.categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCategory(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        value={category.name}
                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                        placeholder="General Admission"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        value={category.price}
                        onChange={(e) => updateCategory(index, 'price', parseFloat(e.target.value))}
                        placeholder="50.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Available Tickets *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        value={category.capacity}
                        onChange={(e) => updateCategory(index, 'capacity', parseInt(e.target.value))}
                        placeholder="800"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        value={category.description}
                        onChange={(e) => updateCategory(index, 'description', e.target.value)}
                        placeholder="Category description..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/events"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}