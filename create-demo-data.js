const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating demo data for presentation...');

  // Create users with different roles
  const hashedPassword = await bcrypt.hash('demo123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tickets.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    }
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@tickets.com',
      name: 'Event Organizer',
      password: hashedPassword,
      role: 'ORGANIZER',
    }
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@tickets.com',
      name: 'John Customer',
      password: hashedPassword,
      role: 'USER',
    }
  });

  console.log('✓ Users created');

  // Create events with categories
  const taylorEvent = await prisma.event.create({
    data: {
      title: 'Taylor Swift - Eras Tour',
      description: 'Experience the magic of Taylor Swift\'s biggest tour yet, featuring songs spanning her entire discography.',
      venue: 'Madison Square Garden',
      address: '4 Pennsylvania Plaza, New York, NY 10001',
      date: new Date('2024-06-15T20:00:00Z'),
      organizerId: organizer.id,
      image: '/images/taylor-swift.jpg',
      capacity: 20000,
      categories: {
        create: [
          {
            name: 'VIP',
            price: 299.99,
            capacity: 100,
            description: 'VIP experience with meet & greet',
          },
          {
            name: 'Floor',
            price: 199.99,
            capacity: 2000,
            description: 'Standing room on the main floor',
          },
          {
            name: 'Lower Bowl',
            price: 149.99,
            capacity: 8000,
            description: 'Premium seating in lower bowl',
          },
          {
            name: 'Upper Bowl',
            price: 89.99,
            capacity: 9900,
            description: 'Great view from upper level',
          },
        ]
      }
    },
    include: { categories: true }
  });

  const edEvent = await prisma.event.create({
    data: {
      title: 'Ed Sheeran - Mathematics Tour',
      description: 'An intimate acoustic evening with Ed Sheeran performing his greatest hits and new material.',
      venue: 'Wembley Stadium',
      address: 'Wembley, London HA9 0WS, UK',
      date: new Date('2024-07-20T19:30:00Z'),
      organizerId: organizer.id,
      image: '/images/ed-sheeran.jpg',
      capacity: 90000,
      categories: {
        create: [
          {
            name: 'Golden Circle',
            price: 175.00,
            capacity: 500,
            description: 'Closest to the stage',
          },
          {
            name: 'Pitch Standing',
            price: 85.00,
            capacity: 20000,
            description: 'Standing area in front of stage',
          },
          {
            name: 'Lower Tier',
            price: 125.00,
            capacity: 35000,
            description: 'Seated lower tier',
          },
          {
            name: 'Upper Tier',
            price: 65.00,
            capacity: 34500,
            description: 'Seated upper tier',
          },
        ]
      }
    },
    include: { categories: true }
  });

  const billyEvent = await prisma.event.create({
    data: {
      title: 'Billy Joel - Piano Man World Tour',
      description: 'The Piano Man returns with his classic hits and unforgettable melodies in this special concert.',
      venue: 'Radio City Music Hall',
      address: '1260 6th Ave, New York, NY 10020',
      date: new Date('2024-08-10T20:00:00Z'),
      organizerId: organizer.id,
      image: '/images/billy-joel.jpg',
      capacity: 6000,
      categories: {
        create: [
          {
            name: 'Orchestra',
            price: 250.00,
            capacity: 1500,
            description: 'Best seats in the house',
          },
          {
            name: 'Mezzanine',
            price: 175.00,
            capacity: 2000,
            description: 'Great elevated view',
          },
          {
            name: 'Balcony',
            price: 95.00,
            capacity: 2500,
            description: 'Upper level seating',
          },
        ]
      }
    },
    include: { categories: true }
  });

  const festivalEvent = await prisma.event.create({
    data: {
      title: 'Electric Daisy Carnival',
      description: 'Three days of electronic dance music featuring the world\'s top DJs and incredible stage productions.',
      venue: 'Las Vegas Motor Speedway',
      address: '7000 N Las Vegas Blvd, Las Vegas, NV 89115',
      date: new Date('2024-05-18T18:00:00Z'),
      organizerId: organizer.id,
      image: '/images/edc.jpg',
      capacity: 135000,
      categories: {
        create: [
          {
            name: '3-Day GA',
            price: 419.99,
            capacity: 120000,
            description: 'General admission for all 3 days',
          },
          {
            name: '3-Day VIP',
            price: 799.99,
            capacity: 10000,
            description: 'VIP experience with exclusive areas',
          },
          {
            name: '3-Day GA+',
            price: 579.99,
            capacity: 5000,
            description: 'Enhanced GA with premium amenities',
          },
        ]
      }
    },
    include: { categories: true }
  });

  console.log('✓ Events and categories created');

  // Create sample orders and tickets
  const order1 = await prisma.order.create({
    data: {
      userId: customer.id,
      eventId: taylorEvent.id,
      status: 'CONFIRMED',
      totalAmount: 349.98,
      tickets: {
        create: [
          {
            categoryId: taylorEvent.categories[0].id, // VIP
            price: 299.99,
            qrCode: 'VIP-TAYLOR-001-' + Date.now(),
            status: 'ACTIVE',
          },
          {
            categoryId: taylorEvent.categories[2].id, // Lower Bowl  
            price: 149.99,
            qrCode: 'LOWER-TAYLOR-001-' + Date.now(),
            status: 'ACTIVE',
          }
        ]
      },
      payments: {
        create: {
          amount: 349.98,
          status: 'COMPLETED',
          method: 'STRIPE',
          stripePaymentIntentId: 'pi_demo_' + Date.now(),
        }
      }
    }
  });

  const order2 = await prisma.order.create({
    data: {
      userId: customer.id,
      eventId: edEvent.id,
      status: 'CONFIRMED',
      totalAmount: 170.00,
      tickets: {
        create: [
          {
            categoryId: edEvent.categories[1].id, // Pitch Standing
            price: 85.00,
            qrCode: 'PITCH-ED-001-' + Date.now(),
            status: 'ACTIVE',
          },
          {
            categoryId: edEvent.categories[1].id, // Pitch Standing
            price: 85.00,
            qrCode: 'PITCH-ED-002-' + Date.now(),
            status: 'ACTIVE',
          }
        ]
      },
      payments: {
        create: {
          amount: 170.00,
          status: 'COMPLETED',
          method: 'PAYPAL',
          paypalOrderId: 'PAYPAL_DEMO_' + Date.now(),
        }
      }
    }
  });

  console.log('✓ Sample orders and tickets created');
  console.log('\n🎉 Demo data created successfully!');
  console.log('\nYou can now login with:');
  console.log('👤 Admin: admin@tickets.com / demo123');
  console.log('🎪 Organizer: organizer@tickets.com / demo123');
  console.log('🎫 Customer: customer@tickets.com / demo123');
  console.log('\n📅 Demo Events:');
  console.log('• Taylor Swift - Eras Tour (June 15, 2024)');
  console.log('• Ed Sheeran - Mathematics Tour (July 20, 2024)');
  console.log('• Billy Joel - Piano Man Tour (August 10, 2024)');
  console.log('• Electric Daisy Carnival (May 18-20, 2024)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());