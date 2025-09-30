'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface PastEvent {
  id: string
  title: string
  description: string | null
  date: Date
  venue: string
  youtubeUrl: string | null
  images: string | null
  featured: boolean
}

interface PastEventFormProps {
  pastEvent?: PastEvent
  onSuccess?: () => void
  onCancel?: () => void
}

interface PastEventFormData {
  title: string
  description: string
  date: string
  venue: string
  youtubeUrl: string
  featured: boolean
}

export default function PastEventForm({
  pastEvent,
  onSuccess,
  onCancel
}: PastEventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>(() => {
    if (pastEvent?.images) {
      try {
        return JSON.parse(pastEvent.images)
      } catch {
        return []
      }
    }
    return []
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PastEventFormData>({
    defaultValues: {
      title: pastEvent?.title || '',
      description: pastEvent?.description || '',
      date: pastEvent?.date ? new Date(pastEvent.date).toISOString().split('T')[0] : '',
      venue: pastEvent?.venue || '',
      youtubeUrl: pastEvent?.youtubeUrl || '',
      featured: pastEvent?.featured || false,
    }
  })

  const onSubmit = async (data: PastEventFormData) => {
    setIsSubmitting(true)

    try {
      const requestData = {
        ...data,
        images,
      }

      const url = pastEvent
        ? `/api/admin/past-events/${pastEvent.id}`
        : '/api/admin/past-events'

      const method = pastEvent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save past event')
      }

      const result = await response.json()

      toast.success(
        pastEvent
          ? 'Past event updated successfully!'
          : 'Past event created successfully!'
      )

      if (!pastEvent) {
        reset()
        setImages([])
      }

      onSuccess?.()
    } catch (error) {
      console.error('Error saving past event:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save past event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const formData = new FormData()
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        formData.append('files', file)
      }
    })

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload images')
      }

      const result = await response.json()
      setImages(prev => [...prev, ...result.files])
      toast.success(`${result.files.length} image(s) uploaded successfully!`)
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload images')
    }

    // Clear the input
    event.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const getYouTubeVideoId = (url: string) => {
    if (!url) return null
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const videoId = getYouTubeVideoId(register('youtubeUrl').name)

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {pastEvent ? 'Edit Past Event' : 'Add New Past Event'}
          </h2>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                {...register('date', { required: 'Date is required' })}
                type="date"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue *
            </label>
            <input
              {...register('venue', { required: 'Venue is required' })}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="Enter venue name"
            />
            {errors.venue && (
              <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="Enter event description"
            />
          </div>

          {/* YouTube Integration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Video URL
            </label>
            <input
              {...register('youtubeUrl')}
              type="url"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {errors.youtubeUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.youtubeUrl.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
            <p className="mt-1 text-sm text-gray-500">
              Select multiple images to upload
            </p>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Event image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Toggle */}
          <div className="flex items-center">
            <input
              {...register('featured')}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Feature this event on homepage
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : pastEvent
                  ? 'Update Event'
                  : 'Create Event'
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}