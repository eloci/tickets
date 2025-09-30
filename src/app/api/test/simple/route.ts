import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Simple test API is working',
    timestamp: new Date().toISOString(),
    status: 'ok'
  })
}

export async function POST() {
  return NextResponse.json({ 
    message: 'POST method working',
    timestamp: new Date().toISOString() 
  })
}