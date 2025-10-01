import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail, testEmailConnection } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // First test the connection
    const connectionValid = await testEmailConnection()
    if (!connectionValid) {
      return NextResponse.json(
        { error: 'Email configuration is invalid' },
        { status: 500 }
      )
    }

    // Send test email
    await sendTestEmail(email)

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully'
    })

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: `Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('Environment variables check:')
    console.log('SMTP_HOST:', process.env.SMTP_HOST)
    console.log('SMTP_PORT:', process.env.SMTP_PORT)
    console.log('SMTP_USER:', process.env.SMTP_USER)
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '[SET]' : '[NOT SET]')
    console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL)
    
    // Just test the connection
    const connectionValid = await testEmailConnection()
    
    return NextResponse.json({
      success: connectionValid,
      message: connectionValid 
        ? 'Email configuration is valid' 
        : 'Email configuration is invalid',
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        sender: process.env.SENDER_EMAIL,
        passwordSet: !!process.env.SMTP_PASS
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasEnvFile: 'Environment loaded'
      }
    })

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      { 
        error: `Email test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          sender: process.env.SENDER_EMAIL,
          passwordSet: !!process.env.SMTP_PASS
        }
      },
      { status: 500 }
    )
  }
}