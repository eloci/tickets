import { NextRequest, NextResponse } from 'next/server'

// Session check is handled by Clerk now
export async function GET(_request: Request) {
  return NextResponse.json({
    error: 'Session check disabled - using Clerk for authentication'
  }, { status: 501 })
}