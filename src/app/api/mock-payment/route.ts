import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Mock payment disabled - feature needs reimplementation' 
  }, { status: 501 })
}