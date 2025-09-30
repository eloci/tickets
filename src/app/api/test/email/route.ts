import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Test email API is working',
    timestamp: new Date().toISOString(),
    env: {
      SMTP_HOST: process.env.SMTP_HOST || 'not set',
      SMTP_USER: process.env.SMTP_USER || 'not set',
      SENDER_EMAIL: process.env.SENDER_EMAIL || 'not set'
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/test/email - Starting')
    
    const { email } = await request.json()
    console.log('Received email:', email)
    
    if (!email) {
      console.log('No email provided')
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Import nodemailer here to avoid potential module loading issues
    const nodemailer = require('nodemailer')
    
    console.log('Creating transporter...')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
      tls: {
        ciphers: 'SSLv3'
      },
      debug: true,
      logger: true
    })

    console.log('Sending test email...')
    const result = await transporter.sendMail({
      from: `"Concert Tickets Test" <${process.env.SENDER_EMAIL || 'noreply@tickets.com'}>`,
      to: email,
      subject: 'Test Email - Brevo Integration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Integration Test</h2>
          <p>This is a test email to verify Brevo SMTP integration.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Sent to:</strong> ${email}</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3>Configuration Details:</h3>
            <ul>
              <li>SMTP Host: ${process.env.SMTP_HOST}</li>
              <li>SMTP Port: ${process.env.SMTP_PORT}</li>
              <li>SMTP User: ${process.env.SMTP_USER}</li>
              <li>Sender: ${process.env.SENDER_EMAIL}</li>
            </ul>
          </div>
          <p>If you received this email, the Brevo integration is working correctly! 🎉</p>
        </div>
      `,
      text: `Email Integration Test\n\nThis is a test email to verify Brevo SMTP integration.\nTimestamp: ${new Date().toLocaleString()}\nSent to: ${email}\n\nIf you received this email, the Brevo integration is working correctly!`
    })

    console.log('Email sent successfully:', result.messageId)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully',
      sentTo: email,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}