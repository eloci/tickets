import { NextRequest, NextResponse } from 'next/server'

// NextAuth endpoint is no longer used - Clerk handles authentication
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'NextAuth is disabled - using Clerk for authentication' 
  }, { status: 501 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'NextAuth is disabled - using Clerk for authentication' 
  }, { status: 501 })
}