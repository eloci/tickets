import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo users using upsert
  const demoOrganizer = await prisma.user.upsert({
    where: { email: 'organizer@example.com' },
    update: {},
    create: {
      name: 'Demo Organizer',
      email: 'organizer@example.com',
      role: 'ORGANIZER',
    },
  })

  const demoUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'user@example.com',
      role: 'USER',
    },
  })

  console.log('✅ Created users')

  // Create demo events
  const event1 = await prisma.event.upsert({
    where: { id: 'rock-legends-2024' },
    update: {},
    create: {
      id: 'rock-legends-2024',
      title: 'Rock Legends Festival 2024',
      description: 'The biggest rock festival of the year featuring legendary bands and rising stars. An unforgettable night of music, energy, and pure rock and roll!',
      venue: 'City Stadium',
      address: '123 Main Street, Downtown',
      date: new Date('2024-12-15T20:00:00'),
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      capacity: 50000,
      organizerId: demoOrganizer.id,
    },
  })

  // Create categories for the event
  const vipCategory = await prisma.category.upsert({
    where: { id: 'vip-rock-legends' },
    update: {},
    create: {
      id: 'vip-rock-legends',
      name: 'VIP',
      description: 'VIP access with backstage meet & greet',
      price: 299.99,
      maxQuantity: 100,
      available: 100,
      eventId: event1.id,
    },
  })

  const premiumCategory = await prisma.category.upsert({
    where: { id: 'premium-rock-legends' },
    update: {},
    create: {
      id: 'premium-rock-legends',
      name: 'Premium',
      description: 'Premium seating with great views',
      price: 149.99,
      maxQuantity: 500,
      available: 500,
      eventId: event1.id,
    },
  })

  const gaCategory = await prisma.category.upsert({
    where: { id: 'ga-rock-legends' },
    update: {},
    create: {
      id: 'ga-rock-legends',
      name: 'General Admission',
      description: 'Standing room access to the main floor',
      price: 79.99,
      maxQuantity: 2000,
      available: 2000,
      eventId: event1.id,
    },
  })

  console.log('✅ Created event with categories')

  // Create more events with simpler structure
  await prisma.event.upsert({
    where: { id: 'electronic-nights' },
    update: {},
    create: {
      id: 'electronic-nights',
      title: 'Electronic Nights: DJ Showcase',
      description: 'Experience the future of electronic music with top DJs from around the world.',
      venue: 'Underground Club',
      address: '456 Electronic Ave, Tech District',
      date: new Date('2024-12-22T22:00:00'),
      image: 'https://images.unsplash.com/photo-1571266028243-4e7e6a1efb44?w=800',
      capacity: 2000,
      organizerId: demoOrganizer.id,
    },
  })

  await prisma.event.upsert({
    where: { id: 'acoustic-unplugged' },
    update: {},
    create: {
      id: 'acoustic-unplugged',
      title: 'Acoustic Unplugged Sessions',
      description: 'Intimate acoustic performances in a cozy setting.',
      venue: 'The Acoustic Lounge',
      address: '789 Melody Lane, Arts Quarter',
      date: new Date('2024-12-30T19:30:00'),
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      capacity: 200,
      organizerId: demoOrganizer.id,
    },
  })

  // Create sample past events
  await prisma.pastEvent.upsert({
    where: { id: 'summer-rock-2023' },
    update: {},
    create: {
      id: 'summer-rock-2023',
      title: 'Summer Rock Festival 2023',
      description: 'Amazing rock festival from last summer with incredible performances.',
      venue: 'Beach Stadium',
      date: new Date('2023-07-15T20:00:00'),
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      attendees: 25000,
    },
  })

  await prisma.pastEvent.upsert({
    where: { id: 'jazz-night-2023' },
    update: {},
    create: {
      id: 'jazz-night-2023',
      title: 'Jazz Night Under Stars 2023',
      description: 'Smooth jazz evening with world-class musicians.',
      venue: 'Rooftop Lounge',
      date: new Date('2023-09-10T20:00:00'),
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
      attendees: 500,
    },
  })

  // Create homepage content
  await prisma.homepageContent.upsert({
    where: { id: 'main-homepage-content' },
    update: {},
    create: {
      id: 'main-homepage-content',
      heroTitle: 'Your Gateway to Amazing Concerts',
      heroSubtitle: 'Discover and book tickets for the hottest concerts and music festivals',
      heroButtonText: 'Browse Events',
      featuredText: 'Don\'t miss out on these incredible upcoming shows!',
      announcement: '🎉 Early bird tickets now available for all upcoming events!',
      isActive: true,
    },
  })

  console.log('✅ Created all events and content')
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })