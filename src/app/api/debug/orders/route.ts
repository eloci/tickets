import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Debug endpoint disabled - feature needs reimplementation' 
  }, { status: 501 })
}