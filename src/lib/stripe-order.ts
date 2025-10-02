import connectDB from '@/lib/database'
import { User, Event, Category, Order, Ticket } from '@/lib/schemas'
import { generateTicketWithQR } from '@/lib/qr-generator'
import { sendTicketEmail } from '@/lib/email-service'
import { PaymentCompletedData } from '@/lib/stripe'
import { clerkClient } from '@clerk/nextjs/server'

export async function finalizeOrder(paymentData: PaymentCompletedData) {
  await connectDB()

  // Idempotency: if we already processed this payment intent, skip
  if (paymentData.paymentIntentId && typeof paymentData.paymentIntentId === 'string') {
    const existing = await Order.findOne({ paymentIntentId: paymentData.paymentIntentId })
    if (existing) {
      return { orderId: existing._id.toString(), tickets: 0, skipped: true }
    }
  }

  // Resolve/create user
  let appUser = await User.findOne({ email: paymentData.customerEmail })
  if (!appUser) {
    try {
      const clerk = await clerkClient()
      const list = await clerk.users.getUserList({ emailAddress: [paymentData.customerEmail] })
      const clerkUser = list?.data?.[0]
      appUser = await User.create({
        clerkId: clerkUser?.id || `external:${paymentData.customerEmail}`,
        email: paymentData.customerEmail,
        name: clerkUser?.fullName || paymentData.customerName,
        image: clerkUser?.imageUrl,
        role: 'USER'
      })
    } catch {
      appUser = await User.create({
        clerkId: `external:${paymentData.customerEmail}`,
        email: paymentData.customerEmail,
        name: paymentData.customerName,
        role: 'USER'
      })
    }
  }

  // Event
  const eventDoc = await Event.findById(paymentData.eventId)
  if (!eventDoc) {
    throw new Error(`Event not found for id ${paymentData.eventId}`)
  }

  // Create order
  const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
  const orderDoc = await Order.create({
    orderNumber,
    user: appUser._id,
    event: eventDoc._id,
    totalAmount: paymentData.amountTotal,
    status: 'CONFIRMED',
    paymentMethod: 'STRIPE',
    ...(paymentData.paymentIntentId ? { paymentIntentId: paymentData.paymentIntentId } : {}),
  })

  // Tickets and category updates
  const emailTickets: Array<{ ticketId: string; tierName: string; seatNumber: string; price: number; qrCodeImage: string }> = []

  for (const t of paymentData.tickets) {
    const categoryDoc = await Category.findById(t.tierId)
    if (!categoryDoc) {
      console.error(`Category not found for tierId ${t.tierId}; skipping ticket creation for this tier`)
      continue
    }
    for (let i = 0; i < t.quantity; i++) {
      const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substring(2)}`
      const ticketData = {
        ticketId,
        eventId: paymentData.eventId,
        eventTitle: paymentData.eventTitle,
        userId: paymentData.customerEmail,
        userEmail: paymentData.customerEmail,
        tierName: t.tierName,
        seatNumber: `${t.tierName}-${i + 1}`,
        purchaseDate: new Date().toISOString(),
        eventDate: paymentData.eventDate,
        eventTime: paymentData.eventTime,
        venue: paymentData.venue,
        price: t.price
      }
      const { signedData, qrCodeImage } = await generateTicketWithQR(ticketData)
      await Ticket.create({
        ticketNumber: signedData.ticketId,
        order: orderDoc._id,
        category: categoryDoc._id,
        price: t.price,
        qrCode: qrCodeImage,
        status: 'VALID'
      })
      categoryDoc.soldTickets = (categoryDoc.soldTickets || 0) + 1
      await categoryDoc.save()
      emailTickets.push({
        ticketId: signedData.ticketId,
        tierName: signedData.tierName || t.tierName,
        seatNumber: signedData.seatNumber || `${t.tierName}-${i + 1}`,
        price: signedData.price,
        qrCodeImage
      })
    }
  }

  // Email
  try {
    await sendTicketEmail({
      customerEmail: paymentData.customerEmail,
      customerName: paymentData.customerName,
      eventTitle: paymentData.eventTitle,
      eventDate: paymentData.eventDate,
      eventTime: paymentData.eventTime,
      venue: paymentData.venue,
      tickets: emailTickets,
      totalAmount: paymentData.amountTotal,
      currency: paymentData.currency
    })
    console.log('Ticket email sent successfully!')
  } catch (emailError) {
    console.error('Failed to send ticket email:', emailError)
  }

  return { orderId: orderDoc._id.toString(), tickets: emailTickets.length, skipped: false }
}
