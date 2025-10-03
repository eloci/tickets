import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/database'
import { User, Event, Category, Order, Ticket } from '@/lib/schemas'

export async function POST(_request: NextRequest) {
  try {
    // Disabled: demo seeding is turned off
    return NextResponse.json({ error: 'Seeding disabled' }, { status: 403 })

    // Auth check not required since seeding is disabled

    // The previous seeding logic was removed to ensure only real data is used.
  } catch (error) {
    console.error('Seed order failed:', error)
    return NextResponse.json({ error: 'Failed to seed order' }, { status: 500 })
  }
}
