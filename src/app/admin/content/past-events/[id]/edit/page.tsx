'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import PastEventForm from '@/components/admin/PastEventForm'

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

export default function EditPastEventPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoaded } = useUser()
  const [pastEvent, setPastEvent] = useState<PastEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const eventId = params.id as string

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    fetchPastEvent()
  }, [status, session, eventId])

  const fetchPastEvent = async () => {
    try {
      const response = await fetch(`/api/admin/past-events/${eventId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch past event')
      }
      const data = await response.json()
      setPastEvent(data)
    } catch (error) {
      console.error('Error fetching past event:', error)
      setError('Failed to load past event')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    router.push('/admin/content/past-events')
  }

  const handleCancel = () => {
    router.push('/admin/content/past-events')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    router.push('/auth/signin')
    return null
  }

  if (!pastEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Past event not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/content/past-events')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Past Events
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Past Event</h1>
          <p className="mt-2 text-gray-600">
            Update the past event details, YouTube video, and images
          </p>
        </div>

        {/* Form */}
        <PastEventForm
          pastEvent={pastEvent}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}