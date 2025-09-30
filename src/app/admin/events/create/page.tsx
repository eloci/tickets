'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  Star,
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
  
  // Authentication check
  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata?.role !== 'admin')) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  // Show loading while checking auth
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
    price: '',
    capacity: '',
    status: 'DRAFT',
    image: null as File | null,
    tags: [] as string[],
    ticketTiers: [
      {
        id: '1',
        name: 'General Admission',
        price: 0,
        capacity: 0,
        description: 'Standard entry to the event',
        benefits: ['Event entry', 'Access to main area']
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
    if (currentTag.trim() && !eventData.tags.includes(currentTag.trim())) {
      setEventData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEventData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
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
    setEventData(prev => ({
      ...prev,
      ticketTiers: prev.ticketTiers.filter(tier => tier.id !== id)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Here you would submit the form data to your API
      console.log('Event data:', eventData)
      // Add your API call here
      
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect on success
      window.location.href = '/admin/events'
    } catch (error) {
      console.error('Error creating event:', error)
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
                    className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === id
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                        >
                          <option value="" className="bg-gray-800">Select category</option>
                          <option value="concert" className="bg-gray-800">🎵 Concert</option>
                          <option value="festival" className="bg-gray-800">🎪 Festival</option>
                          <option value="theater" className="bg-gray-800">🎭 Theater</option>
                          <option value="sports" className="bg-gray-800">⚽ Sports</option>
                          <option value="comedy" className="bg-gray-800">😂 Comedy</option>
                          <option value="conference" className="bg-gray-800">💼 Conference</option>
                          <option value="workshop" className="bg-gray-800">🛠️ Workshop</option>
                          <option value="networking" className="bg-gray-800">🤝 Networking</option>
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
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm resize-none"
                        placeholder="Describe what makes your event special and exciting..."
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Event Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {eventData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 hover:text-gray-200"
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
                          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                          placeholder="Add tags (music, outdoor, family-friendly...)"
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                        >
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
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleInputChange('image', e.target.files?.[0] || null)}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 inline-flex items-center"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
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
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
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
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
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
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
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
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
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
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
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
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
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