import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { User, Event, Category, Order, Ticket } from '@/lib/schemas'

export async function POST(_request: NextRequest) {
  try {
    // Disabled: demo seeding is turned off
    return NextResponse.json({ error: 'Seeding disabled' }, { status: 403 })

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // The previous seeding logic was removed to ensure only real data is used.
  } catch (error) {
    console.error('Seed order failed:', error)
    return NextResponse.json({ error: 'Failed to seed order' }, { status: 500 })
  }
}
