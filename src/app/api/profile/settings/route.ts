import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notifications, phone } = body

    // Validate the data
    if (!notifications || typeof notifications !== 'object') {
      return NextResponse.json({ error: 'Invalid notifications data' }, { status: 400 })
    }

    // Here you could save user preferences to your database
    // For now, we'll just return success since Clerk handles the basic profile data
    
    // Example: Save to your user preferences table
    /*
    await connectDB()
    await UserPreferences.findOneAndUpdate(
      { userId },
      { 
        notifications,
        phone,
        updatedAt: new Date()
      },
      { upsert: true }
    )
    */

    return NextResponse.json({ 
      success: true,
      message: 'Settings updated successfully',
      data: {
        notifications,
        phone
      }
    })

  } catch (error) {
    console.error('Error updating profile settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Here you could fetch user preferences from your database
    // For now, we'll return default preferences
    
    const defaultPreferences = {
      notifications: {
        emailNotifications: true,
        eventReminders: true,
        marketingEmails: false,
        smsNotifications: false
      },
      phone: ''
    }

    return NextResponse.json(defaultPreferences)

  } catch (error) {
    console.error('Error fetching profile settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}