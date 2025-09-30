import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // Get all users for debugging
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    })

    return NextResponse.json({
      session: {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role
      },
      userExistsInDb: !!user,
      userFromDb: user,
      allUsers: allUsers
    })
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json({ 
      error: 'Failed to debug session', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}