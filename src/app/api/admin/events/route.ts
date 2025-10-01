import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { EventsStorage } from '@/lib/storage/events'

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

    const events = EventsStorage.getAll()
    return NextResponse.json(events)
  } catch (error) {
    console.error('❌ Error fetching events:', error)
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
    const newEvent = EventsStorage.create(data)

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating event:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}