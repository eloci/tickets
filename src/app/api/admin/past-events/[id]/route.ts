import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/clerk-auth'
import connectDB from '@/lib/database'
import { Event } from '@/lib/schemas'
import { z } from 'zod'

const pastEventUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string(),
  venue: z.string().min(1, 'Venue is required'),
  youtubeUrl: z.string().url('Invalid YouTube URL').optional().or(z.literal('')),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
})

// GET - Get single past event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // pastEvent model has been removed from schema
    return NextResponse.json({ error: 'Past events functionality disabled' }, { status: 501 })

    /* COMMENTED OUT - pastEvent model doesn't exist
    const { id } = await params
    const pastEvent = await prisma.pastEvent.findUnique({
      where: { id }
    })

    if (!pastEvent) {
      return NextResponse.json({ error: 'Past event not found' }, { status: 404 })
    }

    // Parse images JSON
    const parsedEvent = {
      ...pastEvent,
      images: pastEvent.images ? JSON.parse(pastEvent.images) : []
    }

    return NextResponse.json(parsedEvent)
    */
  } catch (error) {
    console.error('Error fetching past event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch past event' },
      { status: 500 }
    )
  }
}

// PUT - Update past event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = pastEventUpdateSchema.parse(body)

    const { id } = await params
    // pastEvent model has been removed from schema
    return NextResponse.json({ error: 'Past events functionality disabled' }, { status: 501 })

    /* COMMENTED OUT - pastEvent model doesn't exist
    // Check if past event exists
    const existingEvent = await prisma.pastEvent.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Past event not found' }, { status: 404 })
    }

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

    const updatedEvent = await prisma.pastEvent.update({
      where: { id },
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

    return NextResponse.json(updatedEvent)
    */
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error updating past event:', error)
    return NextResponse.json(
      { error: 'Failed to update past event' },
      { status: 500 }
    )
  }
}

// DELETE - Delete past event (DISABLED - pastEvent model removed)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // pastEvent model has been removed from schema
    return NextResponse.json({ error: 'Past events functionality disabled' }, { status: 501 })

    /* COMMENTED OUT - pastEvent model doesn't exist
    const { id } = await params
    // Check if past event exists
    const existingEvent = await prisma.pastEvent.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Past event not found' }, { status: 404 })
    }

    await prisma.pastEvent.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Past event deleted successfully' })
    */
  } catch (error) {
    console.error('Error deleting past event:', error)
    return NextResponse.json(
      { error: 'Failed to delete past event' },
      { status: 500 }
    )
  }
}