import { PrismaClient } from '@prisma/client'
import { generateQRCodeData } from './src/lib/qrcode.ts'

const prisma = new PrismaClient()

async function fixQRCodes() {
  console.log('🔄 Fixing QR codes for existing tickets...')

  try {
    // Get all tickets with old QR format
    const tickets = await prisma.ticket.findMany({
      where: {
        qrCode: {
          startsWith: 'QR-'
        }
      },
      include: {
        order: {
          include: {
            user: true,
            event: true
          }
        }
      }
    })

    console.log(`Found ${tickets.length} tickets with old QR codes`)

    for (const ticket of tickets) {
      // Generate proper QR code data
      const newQRCode = generateQRCodeData(
        ticket.id,
        ticket.order.eventId,
        ticket.order.userId
      )

      // Update the ticket
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { qrCode: newQRCode }
      })

      console.log(`✅ Updated ticket ${ticket.ticketNumber}`)
    }

    console.log('🎉 All QR codes have been fixed!')
  } catch (error) {
    console.error('❌ Error fixing QR codes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixQRCodes()