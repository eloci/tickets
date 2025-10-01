import { NextRequest, NextResponse } from 'next/server'

// Signup is handled by Clerk now
export async function POST(_request: Request) {
  return NextResponse.json({
    error: 'Signup disabled - using Clerk for authentication'
  }, { status: 501 })
}