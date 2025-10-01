import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Simple in-memory storage for events (in production, use a real database)
interface Event {
  id: string
  title: string
  description: string
  date: string
  time?: string
  venue: string
  location: string
  price?: number
  capacity?: number
  image?: string
  status: string
  soldTickets: number
  createdAt: string
  maxTicketsPerPurchase?: number
  youtubeUrl?: string
  ticketTiers?: Array<{
    id: string
    name: string
    price: number
    capacity: number
    description: string
  }>
  organizer?: {
    name: string
    email: string
    phone?: string
  }
  socialLinks?: {
    website?: string
    facebook?: string
    twitter?: string
    instagram?: string
  }
  tags?: string[]
}

const STORAGE_FILE = join(process.cwd(), 'data', 'events.json')

// Initialize with empty data (clean database)
const defaultEvents: Event[] = []

// Load events from file or use defaults
const loadEvents = (): Event[] => {
  try {
    if (existsSync(STORAGE_FILE)) {
      const data = readFileSync(STORAGE_FILE, 'utf-8')
      const events = JSON.parse(data)
      
      // Migrate existing events to add maxTicketsPerPurchase if missing
      return events.map((event: Event) => ({
        ...event,
        maxTicketsPerPurchase: event.maxTicketsPerPurchase || 10 // Default to 10 if not set
      }))
    }
  } catch (error) {
    // Silently fall back to defaults if file can't be read
  }
  return defaultEvents
}

// Save events to file
const saveEvents = (events: Event[]) => {
  try {
    const dir = join(process.cwd(), 'data')
    if (!existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true })
    }
    writeFileSync(STORAGE_FILE, JSON.stringify(events, null, 2))
  } catch (error) {
    // Silently fail if can't save to file
  }
}

// In-memory storage (persisted to file)
let eventsStorage: Event[] = loadEvents()

export const EventsStorage = {
  getAll: (): Event[] => {
    return [...eventsStorage]
  },
  
  getById: (id: string): Event | undefined => {
    return eventsStorage.find(event => event.id === id)
  },
  
  create: (eventData: Omit<Event, 'id' | 'soldTickets' | 'createdAt'>): Event => {
    const newEvent: Event = {
      ...eventData,
      id: `event_${Date.now()}`,
      soldTickets: 0,
      createdAt: new Date().toISOString()
    }
    eventsStorage.push(newEvent)
    saveEvents(eventsStorage) // Persist to file
    return newEvent
  },
  
  update: (id: string, eventData: Partial<Event>): Event | null => {
    const index = eventsStorage.findIndex(event => event.id === id)
    if (index === -1) return null
    
    eventsStorage[index] = { ...eventsStorage[index], ...eventData }
    saveEvents(eventsStorage) // Persist to file
    return eventsStorage[index]
  },
  
  delete: (id: string): boolean => {
    const index = eventsStorage.findIndex(event => event.id === id)
    if (index === -1) return false
    
    eventsStorage.splice(index, 1)
    saveEvents(eventsStorage) // Persist to file
    return true
  }
}

export type { Event }