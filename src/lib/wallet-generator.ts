import { PKPass } from 'passkit-generator'
import crypto from 'crypto'

export interface TicketPassData {
  ticketId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venue: string
  tierName: string
  seatNumber: string
  customerName: string
  qrCodeData: string
  price: number
  currency: string
}

export interface GooglePayPassData {
  ticketId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venue: string
  tierName: string
  seatNumber: string
  customerName: string
  qrCodeData: string
  price: number
  currency: string
}

/**
 * Generate Apple Wallet pass (.pkpass file)
 */
export async function generateAppleWalletPass(ticketData: TicketPassData): Promise<Buffer> {
  try {
    // Create pass instance
    const pass = await PKPass.from({
      model: './certificates/event-pass-template', // You'll need to create this template
      certificates: {
        wwdr: './certificates/wwdr.pem',
        signerCert: './certificates/signerCert.pem',
        signerKey: './certificates/signerKey.pem',
        signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE
      }
    }, {
      serialNumber: ticketData.ticketId,
      description: `${ticketData.eventTitle} Ticket`,
      organizationName: 'Event Tickets',
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER || 'pass.com.yourcompany.eventtickets',
      teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER || 'YOUR_TEAM_ID'
    })

    // Set pass style and data
    pass.type = 'eventTicket'
    
    // Primary fields (main information)
    pass.primaryFields.push({
      key: 'event',
      label: 'EVENT',
      value: ticketData.eventTitle
    })

    // Secondary fields (date, time, venue)
    pass.secondaryFields.push(
      {
        key: 'date',
        label: 'DATE',
        value: new Date(ticketData.eventDate).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
      },
      {
        key: 'time',
        label: 'TIME',
        value: ticketData.eventTime
      }
    )

    // Auxiliary fields (seat, tier info)
    pass.auxiliaryFields.push(
      {
        key: 'seat',
        label: 'SEAT',
        value: ticketData.seatNumber
      },
      {
        key: 'tier',
        label: 'TIER',
        value: ticketData.tierName
      }
    )

    // Back fields (detailed information)
    pass.backFields.push(
      {
        key: 'ticket-id',
        label: 'Ticket ID',
        value: ticketData.ticketId
      },
      {
        key: 'venue',
        label: 'Venue',
        value: ticketData.venue
      },
      {
        key: 'customer',
        label: 'Customer',
        value: ticketData.customerName
      },
      {
        key: 'price',
        label: 'Price',
        value: `${ticketData.price}${ticketData.currency}`
      }
    )

    // Add barcode/QR code
    pass.setBarcodes({
      message: ticketData.qrCodeData,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1'
    })

    // Set colors and styling
    // Note: Colors should be set in the pass template files

    // Generate the pass
    const passBuffer = pass.getAsBuffer()
    return passBuffer

  } catch (error) {
    console.error('Error generating Apple Wallet pass:', error)
    throw new Error('Failed to generate Apple Wallet pass')
  }
}

/**
 * Generate Google Pay pass (JWT format)
 */
export function generateGooglePayPass(ticketData: GooglePayPassData): string {
  try {
    // Google Pay pass data structure
    const passData = {
      iss: process.env.GOOGLE_PAY_ISSUER_EMAIL,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
      payload: {
        eventTicketObjects: [{
          id: `${process.env.GOOGLE_PAY_ISSUER_ID}.${ticketData.ticketId}`,
          classId: `${process.env.GOOGLE_PAY_ISSUER_ID}.event_ticket_class`,
          state: 'ACTIVE',
          ticketHolderName: ticketData.customerName,
          seatInfo: {
            seat: ticketData.seatNumber,
            row: ticketData.tierName
          },
          eventInfo: {
            eventTitle: {
              defaultValue: {
                language: 'en-US',
                value: ticketData.eventTitle
              }
            },
            venue: {
              name: {
                defaultValue: {
                  language: 'en-US',
                  value: ticketData.venue
                }
              }
            },
            startDateTime: {
              date: ticketData.eventDate,
              time: ticketData.eventTime
            }
          },
          barcode: {
            type: 'QR_CODE',
            value: ticketData.qrCodeData,
            alternateText: ticketData.ticketId
          },
          hexBackgroundColor: '#1a1a1a',
          heroImage: {
            sourceUri: {
              uri: process.env.NEXT_PUBLIC_APP_URL + '/images/event-hero.jpg'
            }
          }
        }]
      }
    }

    // Sign the JWT (in production, use proper JWT signing with private key)
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify(passData)).toString('base64url')
    
    // Create a simple JWT structure for Google Pay pass
    // In production, you must sign this with your Google Pay private key
    const signature = crypto
      .createHmac('sha256', process.env.GOOGLE_PAY_PRIVATE_KEY || 'fallback-key')
      .update(`${header}.${payload}`)
      .digest('base64url')

    return `${header}.${payload}.${signature}`

  } catch (error) {
    console.error('Error generating Google Pay pass:', error)
    throw new Error('Failed to generate Google Pay pass')
  }
}

/**
 * Generate both Apple Wallet and Google Pay passes
 */
export async function generateMobileWalletPasses(ticketData: TicketPassData): Promise<{
  appleWalletPass: Buffer
  googlePayJWT: string
}> {
  try {
    const [appleWalletPass, googlePayJWT] = await Promise.all([
      generateAppleWalletPass(ticketData),
      Promise.resolve(generateGooglePayPass(ticketData))
    ])

    return {
      appleWalletPass,
      googlePayJWT
    }
  } catch (error) {
    console.error('Error generating mobile wallet passes:', error)
    throw new Error('Failed to generate mobile wallet passes')
  }
}

/**
 * Create wallet pass download URLs
 */
export interface WalletDownloadUrls {
  appleWalletUrl: string
  googlePayUrl: string
}

export function createWalletDownloadUrls(ticketId: string, baseUrl: string): WalletDownloadUrls {
  return {
    appleWalletUrl: `${baseUrl}/api/wallet/apple/${ticketId}`,
    googlePayUrl: `${baseUrl}/api/wallet/google/${ticketId}`
  }
}