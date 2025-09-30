import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock events data - replace with MongoDB query
    const events = [
      {
        id: '1',
        title: 'Summer Music Festival 2025',
        description: 'Join us for an amazing night of music.',
        date: '2025-07-15',
        venue: 'Central Park Amphitheater',
        location: 'New York, NY',
        price: 75,
        status: 'PUBLISHED'
      },
      {
        id: '2',
        title: 'Rock Concert Extravaganza', 
        description: 'Experience the best rock bands live.',
        date: '2025-08-20',
        venue: 'Madison Square Garden',
        location: 'New York, NY',
        price: 65,
        status: 'PUBLISHED'
      }
    ]

    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}