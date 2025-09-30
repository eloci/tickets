import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { User } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { email, makeAdmin } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find or create the user
    const user = await User.findOneAndUpdate(
      { email },
      {
        email,
        name: email.split('@')[0],
        role: makeAdmin ? 'ADMIN' : 'USER'
      },
      { 
        upsert: true, 
        new: true 
      }
    )

    return NextResponse.json({
      message: `User ${makeAdmin ? 'created/updated as admin' : 'created'}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ 
      error: 'Failed to create user', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}