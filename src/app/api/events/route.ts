import { NextRequest, NextResponse } from 'next/server'
import { EventsStorage } from '@/lib/storage/events'

export async function GET(request: NextRequest) {
  try {
    // Get all events, but only return published ones for public access
    const allEvents = EventsStorage.getAll()
    const publishedEvents = allEvents.filter(event => event.status === 'PUBLISHED')
    
    return NextResponse.json(publishedEvents)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}