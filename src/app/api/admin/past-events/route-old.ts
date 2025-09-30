import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/clerk-auth'
import connectDB from '@/lib/database'
import { z } from 'zod'

const pastEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string(),
  venue: z.string().min(1, 'Venue is required'),
  youtubeUrl: z.string().url('Invalid YouTube URL').optional().or(z.literal('')),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
})

// GET - List all past events (DISABLED - pastEvent model removed)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // pastEvent model has been removed from schema
    return NextResponse.json({ error: 'Past events functionality disabled' }, { status: 501 })

    /* COMMENTED OUT - pastEvent model doesn't exist
    const pastEvents = await prisma.pastEvent.findMany({
      orderBy: {
        date: 'desc'
      }
    })

    // Parse images JSON for each event
    const parsedEvents = pastEvents.map(event => ({
      ...event,
      images: event.images ? JSON.parse(event.images) : []
    }))

    return NextResponse.json(parsedEvents)
    */
  } catch (error) {
    console.error('Error fetching past events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch past events' },
      { status: 500 }
    )
  }
}

// POST - Create new past event (DISABLED - pastEvent model removed)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // pastEvent model has been removed from schema
    return NextResponse.json({ error: 'Past events functionality disabled' }, { status: 501 })

    /* COMMENTED OUT - pastEvent model doesn't exist
    const body = await request.json()
    const validatedData = pastEventSchema.parse(body)

    // Convert string date to Date object
    const eventDate = new Date(validatedData.date)
    
    // Validate YouTube URL format if provided
    if (validatedData.youtubeUrl && validatedData.youtubeUrl.trim()) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/
      if (!youtubeRegex.test(validatedData.youtubeUrl)) {
        return NextResponse.json(
          { error: 'Invalid YouTube URL format' },
          { status: 400 }
        )
      }
    }

    const pastEvent = await prisma.pastEvent.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || '',
        date: eventDate,
        venue: validatedData.venue,
        youtubeUrl: validatedData.youtubeUrl || null,
        images: validatedData.images ? JSON.stringify(validatedData.images) : null,
        featured: validatedData.featured || false,
      }
    })

    return NextResponse.json(pastEvent, { status: 201 })
    */
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating past event:', error)
    return NextResponse.json(
      { error: 'Failed to create past event' },
      { status: 500 }
    )
  }
}