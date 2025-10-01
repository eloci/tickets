'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  description: string
  price: number
  capacity: number
}

interface Event {
  id: string
  title: string
  description?: string
  venue: string
  date: string
  capacity?: number
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
}

interface EventWithDetails extends Event {
  categories: Category[]
  _count: {
    orders: number
  }
}

interface EventsListProps {
  initialEvents: EventWithDetails[]
}

export default function EventsList({ initialEvents }: EventsListProps) {
  const [events, setEvents] = useState<EventWithDetails[]>(initialEvents)
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)
  const [togglingVisibilityId, setTogglingVisibilityId] = useState<string | null>(null)

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      return
    }

    setDeletingEventId(eventId)

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete event')
      }

      // Remove the event from the local state
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
      toast.success('Event deleted successfully!')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete event')
    } finally {
      setDeletingEventId(null)
    }
  }

  const handleToggleVisibility = async (eventId: string, currentStatus: string) => {
    setTogglingVisibilityId(eventId)

    try {
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'

      const response = await fetch(`/api/admin/events/${eventId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update event status')
      }

      // Update the event status in local state
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId
            ? { ...event, status: newStatus as any }
            : event
        )
      )

      const actionText = newStatus === 'PUBLISHED' ? 'shown on homepage' : 'hidden from homepage'
      toast.success(`Event is now ${actionText}!`)
    } catch (error) {
      console.error('Error updating event status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update event status')
    } finally {
      setTogglingVisibilityId(null)
    }
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
        <p className="text-gray-600 mb-6">Get started by creating your first event</p>
        <Link
          href="/admin/events/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Your First Event
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {events.map((event) => (
          <li key={event.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString()} at {event.venue}
                      </p>
                      <p className="text-sm text-gray-500">
                        {event.categories.length} categories
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{event._count.orders}</p>
                        <p className="text-xs text-gray-500">Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{event.capacity}</p>
                        <p className="text-xs text-gray-500">Capacity</p>
                      </div>
                      <span className={`px-3 py-1 text-sm rounded-full ${event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        event.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                          event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>

                  {event.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {category.name} - {category.price.toString()}€
                      </span>
                    ))}
                  </div>
                </div>

                <div className="ml-4 flex items-center space-x-2">
                  <Link
                    href={`/events/${event.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View Event"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>

                  <button
                    onClick={() => handleToggleVisibility(event.id, event.status)}
                    disabled={togglingVisibilityId === event.id}
                    className={`p-2 transition-colors ${event.status === 'PUBLISHED'
                      ? 'text-green-600 hover:text-green-700'
                      : 'text-gray-400 hover:text-green-600'
                      }`}
                    title={event.status === 'PUBLISHED' ? 'Hide from homepage' : 'Show on homepage'}
                  >
                    {togglingVisibilityId === event.id ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    ) : event.status === 'PUBLISHED' ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </button>

                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit Event"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>

                  <button
                    onClick={() => handleDeleteEvent(event.id, event.title)}
                    disabled={deletingEventId === event.id}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Event"
                  >
                    {deletingEventId === event.id ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-red-600"></div>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}