import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      session: session ? {
        user: {
          id: session.user?.id,
          name: session.user?.name,
          email: session.user?.email,
          role: session.user?.role,
        }
      } : null,
      message: session ? 'Session found' : 'No session found'
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to check session', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}