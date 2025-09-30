import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/clerk-auth'
import connectDB from '@/lib/database'

// Simple homepage content management - could be stored in MongoDB or environment variables
let homepageContent = {
  heroTitle: 'Experience Live Music Like Never Before',
  heroSubtitle: 'Book tickets for the hottest concerts and events in town',
  featuredEvents: []
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin()
    await connectDB()

    const body = await request.json()
    
    // Update homepage content
    homepageContent = {
      ...homepageContent,
      ...body
    }

    return NextResponse.json({ 
      message: 'Homepage content updated successfully',
      content: homepageContent 
    })
  } catch (error) {
    console.error('Error updating homepage content:', error)
    return NextResponse.json({ 
      error: 'Failed to update homepage content' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    return NextResponse.json(homepageContent)
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch homepage content' 
    }, { status: 500 })
  }
}