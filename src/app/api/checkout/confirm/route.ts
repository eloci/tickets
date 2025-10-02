import { NextRequest, NextResponse } from 'next/server'
import { getCheckoutSession, processPaymentCompleted } from '@/lib/stripe'
import { finalizeOrder } from '@/lib/stripe-order'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }
    const fullSession = await getCheckoutSession(sessionId)
    const paymentData = await processPaymentCompleted(fullSession)
    const result = await finalizeOrder(paymentData)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('Confirm finalize error:', error)
    return NextResponse.json({ error: 'Failed to finalize order' }, { status: 500 })
  }
}
