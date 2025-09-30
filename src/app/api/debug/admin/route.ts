import { NextRequest, NextResponse } from 'next/server'

// Debug endpoint disabled in new architecture
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Debug endpoint disabled - feature needs reimplementation' 
  }, { status: 501 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Debug endpoint disabled - feature needs reimplementation' 
  }, { status: 501 })
}