import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    if (user.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    }

    const events = [
      {
        id: '1',
        title: 'Summer Music Festival 2025',
        description: 'Join us for an amazing night of music.',
        date: '2025-07-15',
        venue: 'Central Park Amphitheater',
        location: 'New York, NY',
        price: 75,
        capacity: 1000,
        soldTickets: 485,
        status: 'PUBLISHED'
      }
    ]

    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    if (user.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    }

    const data = await request.json()
    const newEvent = {
      id: `event_${Date.now()}`,
      ...data,
      soldTickets: 0,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}