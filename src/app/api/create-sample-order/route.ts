import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/database'
import { User, Event, Category, Order, Ticket } from '@/lib/schemas'

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const email = (session.user as any)?.email

    // Ensure app user exists
    const authId = (session.user as any)?.id || (session.user as any)?.sub
    let appUser = await User.findOne({
      $or: [{ clerkId: `google:${authId}` }, { email }]
    })
    if (!appUser && email) {
      appUser = await User.create({
        clerkId: `google:${authId}`,
        email,
        name: (session.user as any)?.name || undefined,
        image: (session.user as any)?.image || undefined,
        role: 'USER'
      })
    }

    if (!appUser) {
      return NextResponse.json({ error: 'User record not found/created' }, { status: 400 })
    }

    // Create or reuse a sample event
    const existingEvent = await Event.findOne({ title: 'Sample Concert', status: 'PUBLISHED' })
    const eventDate = new Date()
    eventDate.setDate(eventDate.getDate() + 14)
    const eventDoc = existingEvent || await Event.create({
      title: 'Sample Concert',
      description: 'A demo event to showcase your profile stats and orders.',
      date: eventDate,
      time: '20:00',
      venue: 'Demo Arena',
      address: '123 Demo St',
      city: 'Sample City',
      imageUrl: '/vercel.svg',
      organizer: appUser._id,
      status: 'PUBLISHED'
    })

    // Create or reuse a sample category (ticket tier)
    let category = await Category.findOne({ event: eventDoc._id, name: 'General Admission' })
    if (!category) {
      category = await Category.create({
        name: 'General Admission',
        description: 'Standing room',
        price: 49.99,
        totalTickets: 500,
        soldTickets: 0,
        benefits: ['Entry', 'Email ticket'],
        event: eventDoc._id
      })
    }

    // Create an order
    const orderNumber = `ORD-DEV-${Date.now().toString().slice(-6)}`
    const order = await Order.create({
      orderNumber,
      user: appUser._id,
      event: eventDoc._id,
      totalAmount: 99.98,
      status: 'CONFIRMED',
      paymentMethod: 'DEV',
      paymentIntentId: `dev_${Date.now()}`
    })

    // Create two tickets and update sold count
    const ticketDocs = []
    for (let i = 1; i <= 2; i++) {
      const ticketNumber = `ticket_dev_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}`
      const t = await Ticket.create({
        ticketNumber,
        order: order._id,
        category: category._id,
        price: category.price,
        qrCode: '',
        status: 'VALID'
      })
      ticketDocs.push(t)
      category.soldTickets = (category.soldTickets || 0) + 1
    }
    await category.save()

    return NextResponse.json({
      message: 'Sample order created',
      orderId: order._id.toString(),
      tickets: ticketDocs.map(t => t._id.toString())
    })
  } catch (error) {
    console.error('Failed to create sample order:', error)
    return NextResponse.json({ error: 'Failed to create sample order' }, { status: 500 })
  }
}
