import { requireAdmin } from '@/lib/clerk-auth'
import connectDB from '@/lib/database'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Globe } from 'lucide-react'
import HomepageContentForm from '@/components/admin/HomepageContentForm'

export default async function HomepageContentPage() {
  const user = await requireAdmin()
  
  // TODO: Implement homepage content with MongoDB
  await connectDB()
  let homepageContent
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/homepage-content`, {
      cache: 'no-store'
    })
    if (response.ok) {
      homepageContent = await response.json()
    } else {
      // Fallback to default content
      homepageContent = {
        id: 'default',
        heroTitle: "Your Gateway to Amazing Concerts",
        heroSubtitle: "Discover and book tickets for the hottest concerts and events in your city",
        heroButtonText: "Browse Events",
        featuredText: null,
        announcement: null,
        isActive: true
      }
    }
  } catch (error) {
    console.error('Failed to fetch homepage content:', error)
    // Fallback to default content
    homepageContent = {
      id: 'default',
      heroTitle: "Your Gateway to Amazing Concerts",
      heroSubtitle: "Discover and book tickets for the hottest concerts and events in your city",
      heroButtonText: "Browse Events",
      featuredText: null,
      announcement: null,
      isActive: true
    }
  }

  /* COMMENTED OUT - homepageContent model doesn't exist
  // Get current homepage content or create default
  let homepageContent = await prisma.homepageContent.findFirst({
    where: { isActive: true }
  })

  if (!homepageContent) {
    // Create default homepage content if none exists
    homepageContent = await prisma.homepageContent.create({
      data: {
        heroTitle: "Your Gateway to Amazing Concerts",
        heroSubtitle: "Discover and book tickets for the hottest concerts and events in your city",
        heroButtonText: "Browse Events",
        isActive: true
      }
    })
  }
  */

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
                <h1 className="text-3xl font-bold text-gray-900">Homepage Content</h1>
                <p className="text-gray-600">Manage your homepage content and appearance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Content Preview */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Current Homepage Preview</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-lg">
              <h1 className="text-4xl font-bold mb-4">{homepageContent.heroTitle}</h1>
              <p className="text-xl mb-6 opacity-90">{homepageContent.heroSubtitle}</p>
              <button className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                {homepageContent.heroButtonText}
              </button>
            </div>
            {homepageContent.featuredText && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Featured Content</h3>
                <p className="text-blue-800">{homepageContent.featuredText}</p>
              </div>
            )}
            {homepageContent.announcement && (
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <h3 className="font-semibold text-yellow-900 mb-2">Announcement</h3>
                <p className="text-yellow-800">{homepageContent.announcement}</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Save className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Edit Homepage Content</h2>
            </div>
          </div>
          <div className="p-6">
            <HomepageContentForm initialData={homepageContent} />
          </div>
        </div>
      </div>
    </div>
  )
}