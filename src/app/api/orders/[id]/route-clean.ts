import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  return NextResponse.json({ 
    error: 'Order details not implemented yet' 
  }, { status: 501 })
}