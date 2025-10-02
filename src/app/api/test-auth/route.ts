import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import connectDB from "@/lib/database"
import { User } from "@/lib/schemas"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated', userId: null })
    }

    await connectDB()

    // Check current user
    let user = await User.findOne({ clerkId: userId })

    const result = {
      authenticated: true,
      clerkUserId: userId,
      userExistsInDB: !!user,
      userRole: user?.role || 'none',
      dbConnectionWorking: true,
      userCreated: false
    }

    // If user doesn't exist, create them
    if (!user) {
      user = await User.create({
        clerkId: userId,
        email: 'test@example.com',
        role: 'ADMIN'
      })
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