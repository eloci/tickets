import crypto from 'crypto'
import QRCode from 'qrcode'

// Secret key for HMAC signing (in production, store in environment variables)
// Support both QR_SECRET_KEY and QR_SECRET env names
const SECRET_KEY = process.env.QR_SECRET_KEY || process.env.QR_SECRET || 'your-secret-key-for-qr-codes-change-in-production'

interface TicketData {
  ticketId: string
  eventId: string
  eventTitle: string
  userId: string
  userEmail: string
  tierName?: string
  seatNumber?: string
  purchaseDate: string
  eventDate: string
  eventTime: string
  venue: string
  price: number
}

interface SignedTicketData extends TicketData {
  signature: string
  timestamp: number
  expiryDate: string
}

/**
 * Create HMAC signature for ticket data
 */
function createSignature(data: string): string {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(data)
    .digest('hex')
}

/**
 * Verify HMAC signature for ticket data
 */
function verifySignature(data: string, signature: string): boolean {
  const expectedSignature = createSignature(data)
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

/**
 * Generate crypto-signed QR code data
 */
export function generateSecureTicketData(ticketData: TicketData): SignedTicketData {
  const timestamp = Date.now()

  // Robust event date parsing to avoid Invalid time value
  const parseEventDateTime = (dateStr?: string, timeStr?: string): Date => {
    // Try direct parse first (covers ISO strings like 2025-10-02T18:00:00.000Z)
    if (dateStr) {
      const direct = new Date(dateStr)
      if (!isNaN(direct.getTime())) return direct
    }
    // If date is likely a date-only string and time provided, try ISO composition
    if (dateStr && timeStr) {
      const isoGuess = `${dateStr}T${timeStr.length === 5 ? timeStr : `${timeStr}:00`}`
      const dt = new Date(isoGuess)
      if (!isNaN(dt.getTime())) return dt
    }
    // Fallback to purchase date if valid
    if (ticketData.purchaseDate) {
      const pd = new Date(ticketData.purchaseDate)
      if (!isNaN(pd.getTime())) return pd
    }
    // Last resort: now
    return new Date()
  }

  const baseEventDate = parseEventDateTime(ticketData.eventDate, ticketData.eventTime)
  const expiryDate = new Date(baseEventDate.getTime() + (24 * 60 * 60 * 1000)).toISOString() // 24 hours after event

  // Create data string for signing
  const dataToSign = JSON.stringify({
    ...ticketData,
    timestamp,
    expiryDate
  })

  // Generate signature
  const signature = createSignature(dataToSign)

  return {
    ...ticketData,
    signature,
    timestamp,
    expiryDate
  }
}

/**
 * Generate QR code image as base64 data URL
 */
export async function generateQRCode(signedData: SignedTicketData): Promise<string> {
  try {
    // Encode the signed data as JSON
    const qrData = JSON.stringify(signedData)

    // Generate QR code with high error correction and good size
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 400
    })

    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Validate QR code data and signature
 */
export interface ValidationResult {
  isValid: boolean
  isExpired: boolean
  ticketData?: SignedTicketData
  error?: string
}

export function validateQRCode(qrDataString: string): ValidationResult {
  try {
    // Parse QR data
    const signedData: SignedTicketData = JSON.parse(qrDataString)

    // Extract signature and data
    const { signature, ...ticketData } = signedData
    const dataToVerify = JSON.stringify({
      ...ticketData,
      timestamp: signedData.timestamp,
      expiryDate: signedData.expiryDate
    })

    // Verify signature
    const isSignatureValid = verifySignature(dataToVerify, signature)
    if (!isSignatureValid) {
      return {
        isValid: false,
        isExpired: false,
        error: 'Invalid signature - ticket may be forged'
      }
    }

    // Check expiry
    const now = new Date()
    const expiryDate = new Date(signedData.expiryDate)
    const isExpired = now > expiryDate

    return {
      isValid: true,
      isExpired,
      ticketData: signedData,
      error: isExpired ? 'Ticket has expired' : undefined
    }

  } catch (error) {
    return {
      isValid: false,
      isExpired: false,
      error: 'Invalid QR code format'
    }
  }
}

/**
 * Generate complete ticket with QR code
 */
export async function generateTicketWithQR(ticketData: TicketData): Promise<{
  signedData: SignedTicketData
  qrCodeImage: string
}> {
  const signedData = generateSecureTicketData(ticketData)
  const qrCodeImage = await generateQRCode(signedData)

  return {
    signedData,
    qrCodeImage
  }
}

/**
 * Extract ticket ID from QR code for quick lookup
 */
export function extractTicketId(qrDataString: string): string | null {
  try {
    const data = JSON.parse(qrDataString)
    return data.ticketId || null
  } catch {
    return null
  }
}