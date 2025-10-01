import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Simple in-memory storage for tickets (in production, use a real database)
export interface Ticket {
  id: string
  orderId: string
  eventId: string
  eventTitle: string
  eventDate: string
  userId: string
  userName: string
  userEmail: string
  ticketType: string
  price: number
  status: 'PURCHASED' | 'USED' | 'REFUNDED' | 'CANCELLED'
  qrCode: string
  purchaseDate: string
  usedDate?: string
  refundDate?: string
  metadata?: Record<string, any>
}

const DATA_DIR = join(process.cwd(), 'data')
const STORAGE_FILE = join(DATA_DIR, 'tickets.json')

// Initialize with empty data (clean database)
const defaultTickets: Ticket[] = []

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

// Load tickets from file or use defaults
const loadTickets = (): Ticket[] => {
  try {
    if (existsSync(STORAGE_FILE)) {
      const data = readFileSync(STORAGE_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return defaultTickets
  } catch (error) {
    console.error('Error loading tickets:', error)
    return defaultTickets
  }
}

// Save tickets to file
const saveTickets = (tickets: Ticket[]): void => {
  try {
    writeFileSync(STORAGE_FILE, JSON.stringify(tickets, null, 2))
  } catch (error) {
    console.error('Error saving tickets:', error)
  }
}

let ticketsStorage: Ticket[] = loadTickets()

export const TicketsStorage = {
  getAll(): Ticket[] {
    return [...ticketsStorage]
  },

  getById(id: string): Ticket | undefined {
    return ticketsStorage.find(ticket => ticket.id === id)
  },

  getByEventId(eventId: string): Ticket[] {
    return ticketsStorage.filter(ticket => ticket.eventId === eventId)
  },

  getByUserId(userId: string): Ticket[] {
    return ticketsStorage.filter(ticket => ticket.userId === userId)
  },

  getByOrderId(orderId: string): Ticket[] {
    return ticketsStorage.filter(ticket => ticket.orderId === orderId)
  },

  create(ticketData: Omit<Ticket, 'id' | 'purchaseDate'>): Ticket {
    const newTicket: Ticket = {
      ...ticketData,
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      purchaseDate: new Date().toISOString()
    }
    
    ticketsStorage.push(newTicket)
    saveTickets(ticketsStorage)
    return newTicket
  },

  update(id: string, ticketData: Partial<Ticket>): Ticket | null {
    const index = ticketsStorage.findIndex(ticket => ticket.id === id)
    if (index === -1) return null
    
    ticketsStorage[index] = { ...ticketsStorage[index], ...ticketData }
    saveTickets(ticketsStorage)
    return ticketsStorage[index]
  },

  delete(id: string): boolean {
    const index = ticketsStorage.findIndex(ticket => ticket.id === id)
    if (index === -1) return false
    
    ticketsStorage.splice(index, 1)
    saveTickets(ticketsStorage)
    return true
  },

  getStats() {
    const totalTickets = ticketsStorage.length
    const usedTickets = ticketsStorage.filter(t => t.status === 'USED').length
    const purchasedTickets = ticketsStorage.filter(t => t.status === 'PURCHASED').length
    const refundedTickets = ticketsStorage.filter(t => t.status === 'REFUNDED').length
    const totalRevenue = ticketsStorage
      .filter(t => t.status === 'PURCHASED' || t.status === 'USED')
      .reduce((sum, ticket) => sum + ticket.price, 0)

    return {
      totalTickets,
      usedTickets,
      purchasedTickets,
      refundedTickets,
      totalRevenue
    }
  }
}