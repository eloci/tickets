import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { EventsStorage } from '@/lib/storage/events'
import { auth, clerkClient } from '@clerk/nextjs/server'

interface EditEventPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  try {
    const { userId } = await auth()

    if (!userId) {
      redirect('/sign-in')
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)

    // Check if user is admin
    if (user.publicMetadata?.role !== 'admin') {
      redirect('/')
    }

    const { id } = await params

    // Get the event to edit using EventsStorage
    const event = EventsStorage.getById(id)

    if (!event) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 -z-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Edit Event
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    {' '}{event.title}
                  </span>
                </h1>
                <p className="text-xl text-gray-200">Update your event details</p>
              </div>
              <div className="text-sm text-gray-300">
                Event ID: {event.id}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative -mt-8 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-white mb-4">Event Edit Form</h2>
                <p className="text-gray-300 mb-8">
                  The edit form is being updated to work with the JSON storage system.
                </p>
                <p className="text-gray-400 mb-8">
                  For now, you can view and manage events from the{' '}
                  <a href="/admin/events" className="text-purple-400 hover:text-purple-300 underline">
                    Events Management page
                  </a>
                </p>
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Current Event Details:</h3>
                  <div className="text-left space-y-2">
                    <p className="text-gray-300"><strong>Title:</strong> {event.title}</p>
                    <p className="text-gray-300"><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-gray-300"><strong>Venue:</strong> {event.venue}</p>
                    <p className="text-gray-300"><strong>Status:</strong> {event.status}</p>
                    {event.price && <p className="text-gray-300"><strong>Price:</strong> {event.price}€</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading edit page:', error)
    redirect('/admin/events')
  }
}