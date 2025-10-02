import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { Ticket, Order, Event, Category } from '@/lib/schemas'
import { validateQRCode } from '@/lib/qr-generator'

export async function POST(request: NextRequest) {
  try {
    // Auth: admins only
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const clerkUser = await currentUser()
    const role = (clerkUser?.publicMetadata as any)?.role || 'USER'
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { qrData, markUsed = true } = await request.json()
    if (!qrData || typeof qrData !== 'string') {
      return NextResponse.json({ error: 'qrData is required' }, { status: 400 })
    }

    // Validate signature and expiry
    const validation = validateQRCode(qrData)
    if (!validation.isValid) {
      return NextResponse.json(
        { isValid: false, isExpired: false, reason: validation.error || 'Invalid QR data' },
        { status: 200 }
      )
    }

    if (validation.isExpired) {
      return NextResponse.json(
        { isValid: true, isExpired: true, reason: 'Ticket has expired', ticketData: validation.ticketData },
        { status: 200 }
      )
    }

    await connectDB()

    const ticketId = validation.ticketData!.ticketId
    const ticketDoc = await Ticket.findOne({ ticketNumber: ticketId })
      .populate({ path: 'order', select: 'orderNumber status createdAt event', populate: { path: 'event', select: 'title date time venue imageUrl' } })
      .populate({ path: 'category', select: 'name price' })
      .setOptions({ strictPopulate: false })

    if (!ticketDoc) {
      return NextResponse.json(
        { isValid: false, isExpired: false, reason: 'Ticket not found in system' },
        { status: 200 }
      )
    }

    const alreadyUsed = ticketDoc.status === 'USED'
    let usedAt: string | null = ticketDoc.usedAt ? new Date(ticketDoc.usedAt).toISOString() : null

    // Optionally mark as used
    if (markUsed && !alreadyUsed) {
      ticketDoc.status = 'USED'
      ticketDoc.usedAt = new Date()
      await ticketDoc.save()
      usedAt = ticketDoc.usedAt.toISOString()
    }

    const eventDoc = (ticketDoc.order as any)?.event as any
    const response = {
      isValid: true,
      isExpired: false,
      alreadyUsed,
      usedAt,
      ticket: {
        id: ticketDoc._id.toString(),
        ticketNumber: ticketDoc.ticketNumber,
        status: ticketDoc.status,
        price: ticketDoc.price,
        category: (ticketDoc.category as any)?.name || null,
      },
      order: {
        id: (ticketDoc.order as any)?._id?.toString() || null,
        orderNumber: (ticketDoc.order as any)?.orderNumber || null,
        status: (ticketDoc.order as any)?.status || null,
        createdAt: (ticketDoc.order as any)?.createdAt ? new Date((ticketDoc.order as any).createdAt).toISOString() : null,
      },
      event: eventDoc
        ? {
          id: eventDoc._id.toString(),
          title: eventDoc.title,
          date: eventDoc.date ? new Date(eventDoc.date).toISOString() : null,
          time: eventDoc.time || null,
          venue: eventDoc.venue || null,
          imageUrl: eventDoc.imageUrl || null,
        }
        : null,
      ticketData: validation.ticketData,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('QR scan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
