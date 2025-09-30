import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Stripe payment processing not implemented yet' 
  }, { status: 501 })
}