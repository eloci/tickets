import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Event, Category } from '@/lib/schemas'

// Public endpoint: returns published events only, shaped for frontend consumption
export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    await connectDB()

    // Fetch only published events
    const events = await Event.find({ status: 'PUBLISHED' })
      .sort({ date: 1 })
      .lean()

    // For each event, fetch categories to build ticket tiers and capacities
    const results = await Promise.all(
      events.map(async (e: any) => {
        const categories = await Category.find({ event: e._id }).lean()

        const ticketTiers = categories.map((c: any) => ({
          id: String(c._id),
          name: c.name,
          price: c.price,
          capacity: c.totalTickets,
          remaining: Math.max(0, (c.totalTickets || 0) - (c.soldTickets || 0)),
          sold: c.soldTickets || 0,
          benefits: Array.isArray(c.benefits) ? c.benefits : [],
          description: c.description || ''
        }))

        const totalCapacity = categories.reduce((sum: number, c: any) => sum + (c.totalTickets || 0), 0)
        const soldTickets = categories.reduce((sum: number, c: any) => sum + (c.soldTickets || 0), 0)

        // Determine a base/min price for convenience
        const minPrice = categories.length > 0 ? Math.min(...categories.map((c: any) => c.price || 0)) : undefined

        return {
          id: String(e._id),
          title: e.title,
          description: e.description || '',
          date: e.date instanceof Date ? e.date.toISOString() : e.date,
          time: e.time || '',
          venue: e.venue || '',
          location: e.city || '',
          image: e.imageUrl || '',
          status: e.status || 'DRAFT',
          soldTickets,
          capacity: totalCapacity || undefined,
          price: minPrice,
          ticketTiers: ticketTiers.length > 0 ? ticketTiers : undefined,
          createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
        }
      })
    )

    return NextResponse.json(results, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}