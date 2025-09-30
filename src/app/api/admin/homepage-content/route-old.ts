import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/clerk-auth'
import connectDB from '@/lib/database'

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin()
    await connectDB()
    }

    const body = await request.json()
    const { 
      id, 
      heroTitle, 
      heroSubtitle, 
      heroButtonText, 
      featuredText, 
      announcement 
    } = body

    // Validate required fields
    if (!heroTitle || !heroSubtitle || !heroButtonText) {
      return NextResponse.json({ 
        error: 'Hero title, subtitle, and button text are required' 
      }, { status: 400 })
    }

    // Update or create the homepage content
    const updatedContent = await prisma.homepageContent.upsert({
      where: { id: id || 'default' },
      update: {
        heroTitle,
        heroSubtitle,
        heroButtonText,
        featuredText: featuredText || null,
        announcement: announcement || null,
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        heroTitle,
        heroSubtitle,
        heroButtonText,
        featuredText: featuredText || null,
        announcement: announcement || null,
        isActive: true
      }
    })

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error('Error updating homepage content:', error)
    return NextResponse.json({ 
      error: 'Failed to update homepage content' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the active homepage content
    const homepageContent = await prisma.homepageContent.findFirst({
      where: { isActive: true }
    })

    if (!homepageContent) {
      // Create default content if none exists
      const defaultContent = await prisma.homepageContent.create({
        data: {
          id: 'default',
          heroTitle: "Your Gateway to Amazing Concerts",
          heroSubtitle: "Discover and book tickets for the hottest concerts and events in your city",
          heroButtonText: "Browse Events",
          isActive: true
        }
      })
      return NextResponse.json(defaultContent)
    }

    return NextResponse.json(homepageContent)
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch homepage content' 
    }, { status: 500 })
  }
}