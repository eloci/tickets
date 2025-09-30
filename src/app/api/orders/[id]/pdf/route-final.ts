import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  return NextResponse.json({ 
    error: 'PDF generation not implemented yet' 
  }, { status: 501 })
}