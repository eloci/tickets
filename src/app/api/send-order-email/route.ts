import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Order email sending not implemented yet' 
  }, { status: 501 })
}