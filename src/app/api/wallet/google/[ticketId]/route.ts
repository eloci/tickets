import { NextRequest, NextResponse } from 'next/server'
import { generateGooglePayPass } from '@/lib/wallet-generator'

// Mock ticket data - in production, fetch from database
const mockTicketData = {
  ticketId: 'demo-ticket-123',
  eventTitle: 'Amazing Concert',
  eventDate: '2025-01-15',
  eventTime: '19:00',
  venue: 'Concert Hall',
  tierName: 'VIP',
  seatNumber: 'VIP-001',
  customerName: 'Demo User',
  qrCodeData: JSON.stringify({ ticketId: 'demo-ticket-123', timestamp: Date.now() }),
  price: 89,
  currency: '€'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { ticketId } = params

    // In production, fetch real ticket data from database
    const ticketData = {
      ...mockTicketData,
      ticketId
    }

    // Generate Google Pay JWT
    const googlePayJWT = generateGooglePayPass(ticketData)

    // Return HTML page that triggers Google Pay
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add to Google Pay</title>
    <script src="https://pay.google.com/gp/p/js/pay.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .ticket-info {
            margin-bottom: 2rem;
        }
        #addToGooglePayButton {
            margin: 1rem auto;
        }
        .error-message {
            color: #ff6b6b;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="ticket-info">
            <h1>🎫 Your Ticket</h1>
            <h2>${ticketData.eventTitle}</h2>
            <p><strong>Date:</strong> ${ticketData.eventDate}</p>
            <p><strong>Time:</strong> ${ticketData.eventTime}</p>
            <p><strong>Venue:</strong> ${ticketData.venue}</p>
            <p><strong>Seat:</strong> ${ticketData.seatNumber}</p>
        </div>
        
        <div id="addToGooglePayButton"></div>
        <div id="errorMessage" class="error-message" style="display: none;"></div>
        
        <p style="margin-top: 2rem; font-size: 0.9em; opacity: 0.8;">
            Click the button above to add this ticket to your Google Pay wallet
        </p>
    </div>

    <script>
        const jwt = '${googlePayJWT}';
        
        function initGooglePay() {
            const button = document.getElementById('addToGooglePayButton');
            const errorDiv = document.getElementById('errorMessage');
            
            try {
                // Create the "Add to Google Pay" button
                const saveButton = document.createElement('div');
                saveButton.style.cursor = 'pointer';
                saveButton.innerHTML = \`
                    <div style="background: #4285f4; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 500; display: inline-flex; align-items: center; gap: 8px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Add to Google Pay
                    </div>
                \`;
                
                saveButton.onclick = function() {
                    try {
                        // Use Google Pay API to save the pass
                        window.open(
                            'https://pay.google.com/gp/v/save/' + encodeURIComponent(jwt),
                            '_blank'
                        );
                    } catch (error) {
                        console.error('Error saving to Google Pay:', error);
                        errorDiv.textContent = 'Failed to add to Google Pay. Please try again.';
                        errorDiv.style.display = 'block';
                    }
                };
                
                button.appendChild(saveButton);
                
            } catch (error) {
                console.error('Error initializing Google Pay:', error);
                errorDiv.textContent = 'Google Pay is not available on this device.';
                errorDiv.style.display = 'block';
            }
        }
        
        // Initialize when page loads
        window.addEventListener('load', initGooglePay);
    </script>
</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html'
      }
    })

  } catch (error) {
    console.error('Error generating Google Pay pass:', error)
    return NextResponse.json(
      { error: 'Failed to generate Google Pay pass' },
      { status: 500 }
    )
  }
}