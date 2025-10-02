'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/use-user'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Save,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Clock,
  Globe,
  Tag,
  FileText,
  Settings,
  Eye,
  Plus,
  X
} from 'lucide-react'

interface TicketTier {
  id: string
  name: string
  price: number
  capacity: number
  description: string
  benefits: string[]
}

export default function CreateEventPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  // ALL HOOKS MUST BE AT THE TOP - Rules of Hooks
  const [eventData, setEventData] = useState({
    title: '',
    category: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    venue: '',
    location: '',
    address: '',
    price: 0,
    capacity: 1000,
    image: '',
    youtubeUrl: '',
    status: 'DRAFT',
    tags: [] as string[],
    ticketTiers: [
      {
        id: '1',
        name: 'General Admission',
        price: 0,
        capacity: 0,
        description: '',
        benefits: ['Event entry']
      }
    ] as TicketTier[],
    socialLinks: {
      website: '',
      facebook: '',
      twitter: '',
      instagram: ''
    },
    organizer: {
      name: '',
      email: '',
      phone: ''
    }
  })

  const [currentTag, setCurrentTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Debug component loading
  useEffect(() => {
    toast('Welcome to Event Creation')
  }, [])

  // Authentication check
  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata?.role !== 'admin')) {
      toast.error('Access denied. Admin privileges required.')
      router.push('/sign-in')
    } else if (isLoaded && user && user.publicMetadata?.role === 'admin') {
      toast.success('Welcome to the Event Creation Dashboard!')
    }
  }, [user, isLoaded, router])

  // Show loading while checking auth - AFTER all hooks
  if (!isLoaded || !user || user.publicMetadata?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: any) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setEventData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev] as any,
        [field]: value
      }
    }))
  }

  const addTag = () => {
    if (!currentTag.trim()) {
      toast.error('Please enter a tag')
      return
    }

    if (eventData.tags.includes(currentTag.trim())) {
      toast.error('Tag already exists')
      return
    }

    setEventData(prev => ({
      ...prev,
      tags: [...prev.tags, currentTag.trim()]
    }))
    setCurrentTag('')
    toast.success('Tag added')
  }

  const removeTag = (tagToRemove: string) => {
    setEventData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
    toast.success('Tag removed')
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return

    setUploadingImage(true)
    setImageFile(file)

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    try {
      const formData = new FormData()
      formData.append('files', file)

      toast('Uploading image...')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Upload failed: ${response.status} - ${errorData}`)
      }

      const result = await response.json()

      if (result.files && result.files.length > 0) {
        const imageUrl = result.files[0]
        setEventData(prev => ({
          ...prev,
          image: imageUrl
        }))
        toast.success('Image uploaded successfully!')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
      toast.error(errorMessage)
      setImagePreview(null)
      setImageFile(null)
    } finally {
      setUploadingImage(false)
    }
  }

  const addTicketTier = () => {
    const newTier: TicketTier = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      capacity: 0,
      description: '',
      benefits: ['Event entry']
    }
    setEventData(prev => ({
      ...prev,
      ticketTiers: [...prev.ticketTiers, newTier]
    }))
    toast('New ticket tier added')
  }

  const updateTicketTier = (id: string, field: string, value: any) => {
    setEventData(prev => ({
      ...prev,
      ticketTiers: prev.ticketTiers.map(tier =>
        tier.id === id ? { ...tier, [field]: value } : tier
      )
    }))
  }

  const removeTicketTier = (id: string) => {
    if (eventData.ticketTiers.length <= 1) {
      toast.error('At least one ticket tier is required')
      return
    }

    setEventData(prev => ({
      ...prev,
      ticketTiers: prev.ticketTiers.filter(tier => tier.id !== id)
    }))
    toast('Ticket tier removed')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔥 FORM SUBMIT TRIGGERED!', e.type)
    e.preventDefault()

    console.log('Form submitted - starting validation...')
    toast('Processing form submission...')

    // Validation
    if (!eventData.title.trim()) {
      console.log('❌ Validation failed: title missing')
      toast.error('Event title is required')
      return
    }

    if (!eventData.description.trim()) {
      toast.error('Event description is required')
      return
    }

    if (!eventData.date) {
      toast.error('Event date is required')
      return
    }

    if (!eventData.venue.trim()) {
      toast.error('Venue is required')
      return
    }

    if (!eventData.location.trim()) {
      toast.error('Location is required')
      return
    }

    if (eventData.ticketTiers.length === 0) {
      toast.error('At least one ticket tier is required')
      return
    }

    // Validate ticket tiers
    for (const tier of eventData.ticketTiers) {
      if (!tier.name.trim()) {
        toast.error(`Ticket tier name is required`)
        return
      }
      if (tier.price <= 0) {
        toast.error(`Ticket tier "${tier.name}" must have a price greater than 0`)
        return
      }
      if (tier.capacity <= 0) {
        toast.error(`Ticket tier "${tier.name}" must have a capacity greater than 0`)
        return
      }
    }

    if (!eventData.organizer.name.trim()) {
      toast.error('Organizer name is required')
      return
    }

    if (!eventData.organizer.email.trim()) {
      toast.error('Organizer email is required')
      return
    }

    setLoading(true)

    // Show loading toast
    const loadingToast = toast.loading('Creating event...')

    try {
      console.log('Submitting event data:', eventData)

      // Prepare data for API
      const eventPayload = {
        ...eventData,
        // Convert dates to proper format if needed
        date: eventData.date,
        time: eventData.time,
        // Ensure ticket tiers have proper data types
        ticketTiers: eventData.ticketTiers.map(tier => ({
          ...tier,
          price: parseFloat(tier.price.toString()),
          capacity: parseInt(tier.capacity.toString())
        }))
      }

      console.log('Prepared payload:', eventPayload)

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      })

      console.log('Response status:', response.status)

      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        // Not JSON, get text content for better error handling
        const textContent = await response.text()
        console.error('Non-JSON response:', textContent)
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Response data:', result)

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`)
      }

      // Success
      toast.success('Event created successfully!', {
        id: loadingToast,
      })

      console.log('Event created successfully:', result)

      // Redirect to events list after short delay
      setTimeout(() => {
        router.push('/admin/events')
      }, 1500)

    } catch (error) {
      console.error('Detailed error creating event:', error)

      let errorMessage = 'Failed to create event'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      toast.error(errorMessage, {
        id: loadingToast,
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 -z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link
                href="/admin/events"
                className="mr-6 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Create
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    {' '}New Event
                  </span>
                </h1>
                <p className="text-xl text-gray-200">Design an amazing experience for your audience</p>

                {/* Test Button for Debugging */}
                <button
                  onClick={() => {
                    console.log('🧪 TEST BUTTON CLICKED!')
                    toast('Test button works!')
                  }}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  🧪 Test Toast
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/15 transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg"
              >
                <Eye className="h-5 w-5 mr-2" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-8 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            {/* Navigation Tabs */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl mb-8 p-2">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'basic', label: 'Basic Info', icon: FileText },
                  { id: 'details', label: 'Event Details', icon: Settings },
                  { id: 'tickets', label: 'Ticket Tiers', icon: Tag },
                  { id: 'organizer', label: 'Organizer Info', icon: Users },
                  { id: 'social', label: 'Social Links', icon: Globe }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* Tab Content */}
            <div className="space-y-8">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
                    <p className="text-gray-300">Essential details about your event</p>
                  </div>

                  <div className="space-y-6">
                    {/* Event Title and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Event Title *
                        </label>
                        <input
                          type="text"
                          value={eventData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                          placeholder="Enter an amazing event title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Event Category *
                        </label>
                        <select
                          value={eventData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                        >
                          <option value="" className="bg-gray-800 text-white">Select category</option>
                          <option value="concert" className="bg-gray-800 text-white">🎵 Concert</option>
                          <option value="festival" className="bg-gray-800 text-white">🎪 Festival</option>
                          <option value="theater" className="bg-gray-800 text-white">🎭 Theater</option>
                          <option value="sports" className="bg-gray-800 text-white">⚽ Sports</option>
                          <option value="comedy" className="bg-gray-800 text-white">😂 Comedy</option>
                          <option value="conference" className="bg-gray-800 text-white">💼 Conference</option>
                          <option value="workshop" className="bg-gray-800 text-white">🛠️ Workshop</option>
                          <option value="networking" className="bg-gray-800 text-white">🤝 Networking</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Event Description *
                      </label>
                      <textarea
                        value={eventData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        required
                        className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg resize-none"
                        placeholder="Describe what makes your event special and exciting..."
                      />
                    </div>

                    {/* YouTube URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        <Globe className="inline h-4 w-4 mr-2" />
                        YouTube Video URL
                      </label>
                      <input
                        type="url"
                        value={eventData.youtubeUrl}
                        onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                        placeholder="https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
                      />
                      <p className="text-gray-400 text-xs mt-2">
                        Add a YouTube video to showcase your event (optional)
                      </p>
                    </div>

                    {/* Event Tags - Displayed as Stickers */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        <Tag className="inline h-4 w-4 mr-2" />
                        Event Tags (as stickers)
                      </label>
                      <p className="text-gray-400 text-xs mb-3">
                        Add tags that will appear as colorful stickers on your event
                      </p>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {eventData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-lg transform hover:scale-105 transition-all duration-200"
                            style={{
                              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
                            }}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 hover:text-gray-200 transition-colors"
                              title="Remove tag"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="flex-1 px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                          placeholder="Add tags (music, outdoor, family-friendly, concert, festival...)"
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg"
                        >
                          <Plus className="h-4 w-4 mr-1 inline" />
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Event Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Event Banner Image
                      </label>
                      <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Event preview"
                              className="max-h-48 mx-auto rounded-lg mb-4"
                            />
                            <button
                              onClick={() => {
                                setImagePreview(null)
                                setImageFile(null)
                                setEventData(prev => ({ ...prev, image: '' }))
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleImageUpload(file)
                            }
                          }}
                          className="hidden"
                          id="image-upload"
                          disabled={uploadingImage}
                        />
                        <label
                          htmlFor="image-upload"
                          className={`cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 inline-flex items-center ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {uploadingImage ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              {imagePreview ? 'Change Image' : 'Upload Image'}
                            </>
                          )}
                        </label>
                        <p className="text-gray-400 text-sm mt-2">
                          Recommended: 1920x1080px, Max 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Details Tab */}
              {activeTab === 'details' && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Event Details</h2>
                    <p className="text-gray-300">When and where your event takes place</p>
                  </div>

                  <div className="space-y-6">
                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          <Calendar className="h-4 w-4 inline mr-2 text-blue-400" />
                          Event Date *
                        </label>
                        <input
                          type="date"
                          value={eventData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          <Clock className="h-4 w-4 inline mr-2 text-green-400" />
                          Start Time *
                        </label>
                        <input
                          type="time"
                          value={eventData.time}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          <Clock className="h-4 w-4 inline mr-2 text-yellow-400" />
                          End Time
                        </label>
                        <input
                          type="time"
                          value={eventData.endTime}
                          onChange={(e) => handleInputChange('endTime', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          <MapPin className="h-4 w-4 inline mr-2 text-purple-400" />
                          Venue Name *
                        </label>
                        <input
                          type="text"
                          value={eventData.venue}
                          onChange={(e) => handleInputChange('venue', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                          placeholder="Amazing Venue Name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          City & State *
                        </label>
                        <input
                          type="text"
                          value={eventData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                          placeholder="New York, NY"
                        />
                      </div>
                    </div>

                    {/* Full Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Full Address
                      </label>
                      <input
                        type="text"
                        value={eventData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                        placeholder="123 Event Street, City, State 12345"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Event Status
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center p-4 bg-white/5 border border-white/20 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                          <input
                            type="radio"
                            name="status"
                            value="DRAFT"
                            checked={eventData.status === 'DRAFT'}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${eventData.status === 'DRAFT' ? 'border-yellow-400 bg-yellow-400' : 'border-white/30'}`} />
                          <div>
                            <div className="text-white font-medium">Draft</div>
                            <div className="text-gray-400 text-sm">Save for later editing</div>
                          </div>
                        </label>
                        <label className="flex items-center p-4 bg-white/5 border border-white/20 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                          <input
                            type="radio"
                            name="status"
                            value="PUBLISHED"
                            checked={eventData.status === 'PUBLISHED'}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${eventData.status === 'PUBLISHED' ? 'border-green-400 bg-green-400' : 'border-white/30'}`} />
                          <div>
                            <div className="text-white font-medium">Published</div>
                            <div className="text-gray-400 text-sm">Make publicly visible</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Ticket Tiers Tab */}
              {activeTab === 'tickets' && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Ticket Tiers</h2>
                    <p className="text-gray-300">Create different ticket types and pricing options</p>
                  </div>

                  <div className="space-y-6">
                    {eventData.ticketTiers.map((tier, index) => (
                      <div key={tier.id} className="bg-white/5 border border-white/20 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-white">
                            {tier.name || `Ticket Tier ${index + 1}`}
                          </h3>
                          {eventData.ticketTiers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTicketTier(tier.id)}
                              className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-white/10 transition-all"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Tier Name *
                            </label>
                            <input
                              type="text"
                              value={tier.name}
                              onChange={(e) => updateTicketTier(tier.id, 'name', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                              placeholder="General Admission, VIP, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Description
                            </label>
                            <input
                              type="text"
                              value={tier.description}
                              onChange={(e) => updateTicketTier(tier.id, 'description', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                              placeholder="Short description of this tier"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <DollarSign className="h-4 w-4 inline mr-1 text-green-400" />
                              Price *
                            </label>
                            <input
                              type="number"
                              value={tier.price}
                              onChange={(e) => updateTicketTier(tier.id, 'price', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                              placeholder="0.00"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <Users className="h-4 w-4 inline mr-1 text-blue-400" />
                              Capacity *
                            </label>
                            <input
                              type="number"
                              value={tier.capacity}
                              onChange={(e) => updateTicketTier(tier.id, 'capacity', parseInt(e.target.value) || 0)}
                              min="1"
                              className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                              placeholder="Available tickets"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addTicketTier}
                      className="w-full p-4 border-2 border-dashed border-white/30 rounded-xl text-gray-300 hover:border-purple-400 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center justify-center"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Another Ticket Tier
                    </button>
                  </div>
                </div>
              )}

              {/* Organizer Info Tab */}
              {activeTab === 'organizer' && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Organizer Information</h2>
                    <p className="text-gray-300">Contact details for event attendees</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Organizer Name *
                        </label>
                        <input
                          type="text"
                          value={eventData.organizer.name}
                          onChange={(e) => handleNestedInputChange('organizer', 'name', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                          placeholder="Your name or company"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Contact Email *
                        </label>
                        <input
                          type="email"
                          value={eventData.organizer.email}
                          onChange={(e) => handleNestedInputChange('organizer', 'email', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={eventData.organizer.phone}
                        onChange={(e) => handleNestedInputChange('organizer', 'phone', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links Tab */}
              {activeTab === 'social' && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Social Media & Links</h2>
                    <p className="text-gray-300">Connect your event with social media and websites</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          🌐 Website
                        </label>
                        <input
                          type="url"
                          value={eventData.socialLinks.website}
                          onChange={(e) => handleNestedInputChange('socialLinks', 'website', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                          placeholder="https://your-website.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          📘 Facebook
                        </label>
                        <input
                          type="url"
                          value={eventData.socialLinks.facebook}
                          onChange={(e) => handleNestedInputChange('socialLinks', 'facebook', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                          placeholder="https://facebook.com/yourevent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          🐦 Twitter
                        </label>
                        <input
                          type="url"
                          value={eventData.socialLinks.twitter}
                          onChange={(e) => handleNestedInputChange('socialLinks', 'twitter', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                          placeholder="https://twitter.com/yourevent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          📷 Instagram
                        </label>
                        <input
                          type="url"
                          value={eventData.socialLinks.instagram}
                          onChange={(e) => handleNestedInputChange('socialLinks', 'instagram', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900/90 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm shadow-lg"
                          placeholder="https://instagram.com/yourevent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-gray-300 text-sm">
                  * Required fields must be completed
                </div>
                <div className="flex gap-4">
                  <Link
                    href="/admin/events"
                    className="px-6 py-3 text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={(e) => {
                      console.log('🔥 BUTTON CLICKED!', e.type)
                      toast('Button clicked - triggering submit...')
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Event
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}