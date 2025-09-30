'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface HomepageContent {
  id: string
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  featuredText: string | null
  announcement: string | null
  isActive: boolean
}

interface HomepageContentFormProps {
  initialData: HomepageContent
}

export default function HomepageContentForm({ initialData }: HomepageContentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    heroTitle: initialData.heroTitle,
    heroSubtitle: initialData.heroSubtitle,
    heroButtonText: initialData.heroButtonText,
    featuredText: initialData.featuredText || '',
    announcement: initialData.announcement || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/homepage-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: initialData.id,
          ...formData,
          featuredText: formData.featuredText || null,
          announcement: formData.announcement || null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update homepage content')
      }

      toast.success('Homepage content updated successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error updating homepage content:', error)
      toast.error('Failed to update homepage content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hero Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Hero Section</h3>

        <div>
          <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Hero Title
          </label>
          <input
            type="text"
            id="heroTitle"
            name="heroTitle"
            value={formData.heroTitle}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            placeholder="Your Gateway to Amazing Concerts"
            required
          />
        </div>

        <div>
          <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 mb-2">
            Hero Subtitle
          </label>
          <textarea
            id="heroSubtitle"
            name="heroSubtitle"
            rows={3}
            value={formData.heroSubtitle}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            placeholder="Discover and book tickets for the hottest concerts and events in your city"
            required
          />
        </div>

        <div>
          <label htmlFor="heroButtonText" className="block text-sm font-medium text-gray-700 mb-2">
            Hero Button Text
          </label>
          <input
            type="text"
            id="heroButtonText"
            name="heroButtonText"
            value={formData.heroButtonText}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            placeholder="Browse Events"
            required
          />
        </div>
      </div>

      {/* Optional Content */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Optional Content</h3>

        <div>
          <label htmlFor="featuredText" className="block text-sm font-medium text-gray-700 mb-2">
            Featured Content (Optional)
          </label>
          <textarea
            id="featuredText"
            name="featuredText"
            rows={3}
            value={formData.featuredText}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            placeholder="Add special announcements or featured content here..."
          />
          <p className="mt-1 text-sm text-gray-500">This will appear as a highlighted section on the homepage</p>
        </div>

        <div>
          <label htmlFor="announcement" className="block text-sm font-medium text-gray-700 mb-2">
            Announcement (Optional)
          </label>
          <textarea
            id="announcement"
            name="announcement"
            rows={2}
            value={formData.announcement}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            placeholder="Important announcements, news, or updates..."
          />
          <p className="mt-1 text-sm text-gray-500">This will appear as a banner announcement on the homepage</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  )
}