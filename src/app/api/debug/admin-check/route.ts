import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Not authenticated', 
        userId: null,
        hasAuth: false
      }, { status: 401 })
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    
    const isAdmin = user.publicMetadata?.role === 'admin'
    
    return NextResponse.json({
      success: true,
      userId,
      hasAuth: true,
      userEmail: user.emailAddresses[0]?.emailAddress,
      userRole: user.publicMetadata?.role,
      isAdmin,
      publicMetadata: user.publicMetadata,
      firstName: user.firstName,
      lastName: user.lastName
    })
    
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}