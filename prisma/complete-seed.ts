import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting complete seed...')

  // Create demo organizer user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const demoOrganizer = await prisma.user.upsert({
    where: { email: 'organizer@example.com' },
    update: {},
    create: {
      id: 'demo-organizer',
      name: 'Demo Organizer',
      email: 'organizer@example.com',
      password: hashedPassword,
      role: 'ORGANIZER',
    },
  })

  console.log('✅ Created demo organizer')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: 'demo-admin',
      name: 'Demo Admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ Created demo admin')

  // Create events with only basic fields
  const event1 = await prisma.event.upsert({
    where: { id: 'rock-legends-concert' },
    update: {},
    create: {
      id: 'rock-legends-concert',
      title: 'Rock Legends Live Concert',
      description: 'Join us for an unforgettable night of classic rock music featuring legendary artists.',
      venue: 'City Stadium',
      address: '123 Main Street, Downtown',
      date: new Date('2024-12-15T20:00:00'),
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      posterUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      capacity: 50000,
      organizerId: demoOrganizer.id,
    },
  })

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
      posterUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
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
      posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      capacity: 200,
      organizerId: demoOrganizer.id,
    },
  })

  console.log('✅ Created events')

  // Create categories for the main event
  await prisma.category.upsert({
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

  await prisma.category.upsert({
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

  await prisma.category.upsert({
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

  console.log('✅ Created categories')

  // Create past events
  await prisma.pastEvent.upsert({
    where: { id: 'summer-rock-2023' },
    update: {},
    create: {
      id: 'summer-rock-2023',
      title: 'Summer Rock Festival 2023',
      description: 'Amazing rock festival from last summer with incredible performances.',
      venue: 'Beach Stadium',
      date: new Date('2023-07-15T20:00:00'),
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'
      ]),
      featured: true,
      isPublished: true,
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
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
        'https://images.unsplash.com/photo-1571266028243-4e7e6a1efb44?w=800'
      ]),
      featured: true,
      isPublished: true,
    },
  })

  console.log('✅ Created past events')

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

  console.log('✅ Created homepage content')
  console.log('🎉 Complete seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })