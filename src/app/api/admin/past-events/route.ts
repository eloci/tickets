import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/clerk-auth'
import connectDB from '@/lib/database'

// GET - Get all past events
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin()
    await connectDB()

    return NextResponse.json({ pastEvents: [] })
  } catch (error) {
    console.error('Error getting past events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create past event
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    await connectDB()

    return NextResponse.json({ error: 'Past events functionality not implemented yet' }, { status: 501 })
  } catch (error) {
    console.error('Error creating past event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}