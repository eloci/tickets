import { NextRequest, NextResponse } from 'next/server'
import { sendTicketEmail } from '@/lib/email-service'
import { generateTicketWithQR } from '@/lib/qr-generator'
import connectDB from '@/lib/database'
import { Order, Ticket, User } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, customerEmail: emailOverride, customerName: nameOverride } = body || {}

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    await connectDB()
    const order = await Order.findById(orderId)
      .populate({ path: 'event', select: 'title date time venue' })
      .populate('user', 'email name')
      .setOptions({ strictPopulate: false })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const customerEmail = emailOverride || order.user?.email
    const customerName = nameOverride || order.user?.name || 'Customer'
    if (!customerEmail) {
      return NextResponse.json({ error: 'No customer email found for order' }, { status: 400 })
    }

    const tickets = await Ticket.find({ order: order._id }).populate('category', 'name price').lean()

    // Prepare ticket items with QR images (use stored QR, or generate if missing)
    const emailTickets = [] as Array<{ ticketId: string; tierName: string; seatNumber: string; price: number; qrCodeImage: string }>
    for (const t of tickets as any[]) {
      let qrCodeImage: string | undefined = t.qrCode
      let ticketId = t.ticketNumber || (t._id ? t._id.toString() : '')
      const tierName = (t as any).category?.name || 'General'
      const price = (t as any).category?.price || 0
      const seatNumber = t.ticketNumber || `T-${(t._id ? t._id.toString() : '').slice(-6)}`

      if (!qrCodeImage) {
        const { qrCodeImage: generatedQr } = await generateTicketWithQR({
          ticketId,
          eventId: order.event?._id?.toString() || '',
          eventTitle: order.event?.title || 'Event',
          userId: customerEmail,
          userEmail: customerEmail,
          tierName,
          seatNumber,
          purchaseDate: new Date(order.createdAt).toISOString(),
          eventDate: order.event?.date ? new Date(order.event.date).toISOString().split('T')[0] : '',
          eventTime: order.event?.time || '',
          venue: order.event?.venue || '',
          price
        })
        qrCodeImage = generatedQr
      }

      emailTickets.push({ ticketId, tierName, seatNumber, price, qrCodeImage: qrCodeImage! })
    }

    const emailData = {
      customerEmail,
      customerName,
      eventTitle: order.event?.title || 'Event',
      eventDate: order.event?.date ? new Date(order.event.date).toISOString().split('T')[0] : '',
      eventTime: order.event?.time || '',
      venue: order.event?.venue || '',
      tickets: emailTickets,
      totalAmount: order.totalAmount || 0,
      currency: 'EUR'
    }

    await sendTicketEmail(emailData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending ticket email:', error)
    return NextResponse.json({ error: 'Failed to send ticket email' }, { status: 500 })
  }
}