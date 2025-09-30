import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    error: 'Stripe webhook not implemented yet' 
  }, { status: 501 })
}