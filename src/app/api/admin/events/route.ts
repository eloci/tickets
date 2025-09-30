import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([{ id: '1', title: 'Test Event' }])
}

export async function POST() {
  return NextResponse.json({ id: '2', title: 'New Event' })
}