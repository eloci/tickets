'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface DeletePastEventButtonProps {
  eventId: string
  eventTitle: string
  onDeleted: () => void
}

export default function DeletePastEventButton({
  eventId,
  eventTitle,
  onDeleted
}: DeletePastEventButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/past-events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete past event')
      }

      toast.success('Past event deleted successfully!')
      onDeleted()
    } catch (error) {
      console.error('Error deleting past event:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete past event')
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-600">Delete "{eventTitle}"?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Yes'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
    >
      <Trash2 className="h-3 w-3 mr-1" />
      Delete
    </button>
  )
}