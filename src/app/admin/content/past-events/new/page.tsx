'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import PastEventForm from '@/components/admin/PastEventForm'

export default function NewPastEventPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    router.push('/auth/signin')
    return null
  }

  const handleSuccess = () => {
    router.push('/admin/content/past-events')
  }

  const handleCancel = () => {
    router.push('/admin/content/past-events')
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Past Event</h1>
          <p className="mt-2 text-gray-600">
            Create a new past event entry with YouTube video and images
          </p>
        </div>

        {/* Form */}
        <PastEventForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}