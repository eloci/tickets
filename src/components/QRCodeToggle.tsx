'use client'

export function QRCodeToggle({ orderId }: { orderId: string }) {
  const toggleQRCodes = () => {
    const qrSection = document.getElementById(`qr-section-${orderId}`)
    if (qrSection) {
      qrSection.classList.toggle('hidden')
    }
  }

  return (
    <button
      onClick={toggleQRCodes}
      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors"
    >
      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="5" height="5" />
        <rect x="16" y="3" width="5" height="5" />
        <rect x="3" y="16" width="5" height="5" />
        <path d="m21 16-3.5-3.5-2.5 2.5" />
        <path d="m13 13 3 3 3-3" />
        <path d="m13 21 3-3" />
      </svg>
      Show QR Codes
    </button>
  )
}