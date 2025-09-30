import { NextRequest, NextResponse } from 'next/server'

// Signup is handled by Clerk now
export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'Signup disabled - using Clerk for authentication'
  }, { status: 501 })
}