import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/clerk-auth'
import connectDB from '@/lib/database'
import { User } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin()
    await connectDB()

    const { userId, role } = await req.json()

    // Update user role in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'User role updated successfully',
      user: updatedUser 
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}