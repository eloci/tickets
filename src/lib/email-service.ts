import nodemailer from 'nodemailer'

export interface TicketEmailData {
  customerEmail: string
  customerName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venue: string
  tickets: Array<{
    ticketId: string
    tierName: string
    seatNumber: string
    price: number
    qrCodeImage: string // Base64 data URL
  }>
  totalAmount: number
  currency: string
}

// Create nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports like 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

/**
 * Generate HTML email template for tickets
 */
function generateTicketEmailHTML(data: TicketEmailData): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Event Tickets</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 30px 20px;
        }
        .event-info {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
            text-align: center;
        }
        .event-info h2 {
            margin: 0 0 15px 0;
            font-size: 24px;
            font-weight: 700;
        }
        .event-details {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            margin-top: 15px;
        }
        .event-detail {
            text-align: center;
            margin: 5px;
        }
        .event-detail strong {
            display: block;
            font-size: 18px;
            margin-bottom: 5px;
        }
        .ticket {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            margin: 20px 0;
            padding: 20px;
            position: relative;
            overflow: hidden;
        }
        .ticket::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        .ticket-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .ticket-title {
            font-size: 18px;
            font-weight: 700;
            color: #333;
        }
        .ticket-price {
            font-size: 16px;
            font-weight: 600;
            color: #667eea;
        }
        .ticket-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
        }
        .ticket-detail {
            font-size: 14px;
        }
        .ticket-detail strong {
            color: #555;
        }
        .qr-section {
            text-align: center;
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .qr-code {
            width: 150px;
            height: 150px;
            margin: 10px auto;
            border: 2px solid #ddd;
            border-radius: 8px;
        }
        .wallet-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            text-align: center;
        }
        .wallet-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 15px;
            flex-wrap: wrap;
        }
        .wallet-btn {
            display: inline-block;
            padding: 12px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            transition: transform 0.2s;
        }
        .wallet-btn:hover {
            transform: translateY(-2px);
        }
        .apple-wallet {
            background: #000;
            color: white;
        }
        .google-pay {
            background: #4285f4;
            color: white;
        }
        .total-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            text-align: center;
        }
        .total-amount {
            font-size: 24px;
            font-weight: 700;
            margin: 10px 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .important-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 10px;
            }
            .event-details {
                flex-direction: column;
            }
            .ticket-header {
                flex-direction: column;
                text-align: center;
            }
            .ticket-details {
                grid-template-columns: 1fr;
            }
            .wallet-buttons {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎫 Your Event Tickets</h1>
            <p>Thank you for your purchase!</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Event Information -->
            <div class="event-info">
                <h2>${data.eventTitle}</h2>
                <div class="event-details">
                    <div class="event-detail">
                        <strong>📅 Date</strong>
                        ${data.eventDate}
                    </div>
                    <div class="event-detail">
                        <strong>🕐 Time</strong>
                        ${data.eventTime}
                    </div>
                    <div class="event-detail">
                        <strong>📍 Venue</strong>
                        ${data.venue}
                    </div>
                </div>
            </div>

            <!-- Customer Info -->
            <p><strong>Hello ${data.customerName},</strong></p>
            <p>Your tickets have been successfully purchased and are ready for use! Each ticket contains a secure QR code for entry.</p>

            <!-- Individual Tickets -->
            ${data.tickets.map(ticket => `
            <div class="ticket">
                <div class="ticket-header">
                    <div class="ticket-title">${ticket.tierName}</div>
                    <div class="ticket-price">${data.currency} ${ticket.price.toFixed(2)}</div>
                </div>
                <div class="ticket-details">
                    <div class="ticket-detail">
                        <strong>Ticket ID:</strong> ${ticket.ticketId}
                    </div>
                    <div class="ticket-detail">
                        <strong>Seat:</strong> ${ticket.seatNumber}
                    </div>
                </div>
                <div class="qr-section">
                    <p><strong>🔒 Secure QR Code</strong></p>
                    <img src="cid:qr-${ticket.ticketId}" alt="QR Code for ${ticket.tierName}" class="qr-code">
                    <p style="font-size: 12px; color: #666; margin-top: 10px;">
                        Present this QR code at the venue entrance
                    </p>
                </div>
            </div>
            `).join('')}

            <!-- Mobile Wallet Section -->
            <div class="wallet-section">
                <h3>📱 Add to Mobile Wallet</h3>
                <p>Save your tickets to your mobile wallet for quick access at the venue:</p>
                <div class="wallet-buttons">
                    ${data.tickets.map(ticket => `
                        <a href="${baseUrl}/api/wallet/apple/${ticket.ticketId}" class="wallet-btn apple-wallet">
                            🍎 Add to Apple Wallet
                        </a>
                        <a href="${baseUrl}/api/wallet/google/${ticket.ticketId}" class="wallet-btn google-pay">
                            📱 Add to Google Pay
                        </a>
                    `).join('')}
                </div>
            </div>

            <!-- Total Section -->
            <div class="total-section">
                <h3>💳 Payment Summary</h3>
                <div class="total-amount">Total: ${data.currency} ${data.totalAmount.toFixed(2)}</div>
                <p>Payment processed securely</p>
            </div>

            <!-- Important Notes -->
            <div class="important-note">
                <h4>📋 Important Information:</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Arrive 30 minutes before the event starts</li>
                    <li>Present your QR code at the entrance</li>
                    <li>Each QR code can only be used once</li>
                    <li>Keep your tickets secure and don't share screenshots</li>
                    <li>Contact support if you have any issues</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Need help? Contact our support team</p>
            <p>This email was sent to ${data.customerEmail}</p>
            <p style="margin-top: 15px; font-size: 12px;">
                Event Tickets • Secure • Reliable • Instant
            </p>
        </div>
    </div>
</body>
</html>
`
}

/**
 * Send ticket email with QR codes and wallet links
 */
export async function sendTicketEmail(data: TicketEmailData): Promise<void> {
  try {
    const transporter = createTransporter()
    
    await transporter.verify()
    
    const htmlContent = generateTicketEmailHTML(data)
    
    const attachments = data.tickets.map((ticket, index) => ({
      filename: `ticket-${index + 1}-qr.png`,
      content: ticket.qrCodeImage.split(',')[1], // Remove data:image/png;base64, prefix
      encoding: 'base64' as const,
      cid: `qr-${ticket.ticketId}` // For referencing in HTML
    }))

    const mailOptions = {
      from: {
        name: 'Event Tickets',
        address: process.env.SENDER_EMAIL || process.env.SMTP_USER || 'noreply@eventtickets.com'
      },
      to: data.customerEmail,
      subject: `🎫 Your tickets for ${data.eventTitle}`,
      html: htmlContent,
      attachments,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    }
    
    const result = await transporter.sendMail(mailOptions)
    
  } catch (error) {
    console.error('Error sending ticket email:', error)
    throw new Error(`Failed to send ticket email: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}