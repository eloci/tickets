'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, Plus, Calendar, Youtube, Edit } from 'lucide-react'
import DeletePastEventButton from '@/components/admin/DeletePastEventButton'

interface PastEvent {
  id: string
  title: string
  description: string | null
  venue: string
  date: string
  youtubeUrl: string | null
  images: string[]
  featured: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export default function PastEventsClientPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    fetchPastEvents()
  }, [isLoaded, user])

  const fetchPastEvents = async () => {
    try {
      const response = await fetch('/api/admin/past-events')
      if (!response.ok) {
        throw new Error('Failed to fetch past events')
      }
      const data = await response.json()
      setPastEvents(data)
    } catch (error) {
      console.error('Error fetching past events:', error)
      setError('Failed to load past events')
    } finally {
      setLoading(false)
    }
  }

  const handleEventDeleted = () => {
    fetchPastEvents() // Refresh the list
  }

  if (!isLoaded || loading) {
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

  if (!user) {
    router.push('/sign-in')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Past Events</h1>
                <p className="text-gray-600">Manage past events with photos and YouTube videos</p>
              </div>
            </div>
            <Link
              href="/admin/content/past-events/new"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Past Event
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pastEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Past Events Yet</h2>
            <p className="text-gray-600 mb-8">
              Start building your event history by adding past concerts and events with photos and videos.
            </p>
            <Link
              href="/admin/content/past-events/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Past Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
                {event.images && event.images.length > 0 ? (
                  <img
                    src={event.images[0]}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-white" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${event.featured
                      ? 'bg-yellow-100 text-yellow-800'
                      : event.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {event.featured ? 'Featured' : event.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {event.youtubeUrl && (
                      <Youtube className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{event.venue}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>

                  {event.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>
                  )}

                  {event.images && event.images.length > 0 && (
                    <p className="text-xs text-gray-500 mb-4">
                      {event.images.length} image{event.images.length !== 1 ? 's' : ''}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/content/past-events/${event.id}/edit`}
                        className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Link>
                      {event.youtubeUrl && (
                        <a
                          href={event.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          <Youtube className="h-3 w-3 mr-1" />
                          Video
                        </a>
                      )}
                    </div>
                    <DeletePastEventButton
                      eventId={event.id}
                      eventTitle={event.title}
                      onDeleted={handleEventDeleted}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}