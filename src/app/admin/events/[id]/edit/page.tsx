import { requireAdmin } from '@/lib/clerk-auth'
import connectDB from '@/lib/database'
import { Event } from '@/lib/schemas'
import { notFound } from 'next/navigation'
import EventForm from '@/components/admin/EventForm'

interface EditEventPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const user = await requireAdmin()
  const { id } = await params
  await connectDB()

  // Check if user is admin or organizer
  if (session.user.role !== 'ADMIN' && session.user.role !== 'ORGANIZER') {
    redirect('/')
  }

  // Get the event to edit
  const event = await Event.findById(id).populate('organizer').lean()

  if (!event) {
    notFound()
  }

  // TODO: Implement organizer role checking with MongoDB
  // if (user.role === 'ORGANIZER' && event.organizer?.toString() !== user.id) {
  //   redirect('/admin/events')
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
              <p className="text-gray-600">Update your event details</p>
            </div>
            <div className="text-sm text-gray-500">
              Event ID: {event.id}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventForm
          initialData={event}
          isEditing={true}
        />
      </div>
    </div>
  )
}