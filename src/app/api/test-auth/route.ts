import { NextResponse } from "next/server"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from "@/lib/database"
import { User } from "@/lib/schemas"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Not authenticated', userId: null })

    await connectDB()

    // Check current user
    const authId = (session.user as any)?.id || (session.user as any)?.sub
    let user = await User.findOne({ clerkId: `google:${authId}` })

    const result = {
      authenticated: true,
      authId: authId,
      userExistsInDB: !!user,
      userRole: user?.role || 'none',
      dbConnectionWorking: true,
      userCreated: false
    }

    // If user doesn't exist, create them
    if (!user) {
      user = await User.create({ clerkId: `google:${authId}`, email: 'test@example.com', role: 'ADMIN' })
      result.userCreated = true
      result.userRole = user.role
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Test API Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      dbConnectionWorking: false
    })
  }
}