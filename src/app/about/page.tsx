import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              Concert Tickets
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link href="/events" className="text-gray-300 hover:text-white transition-colors">Events</Link>
              <Link href="/auth/signin" className="text-gray-300 hover:text-white transition-colors">Sign In</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-8">About Concert Tickets</h1>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                Concert Tickets is your premier destination for booking tickets to the world's most amazing
                concerts and music festivals. We're passionate about connecting music lovers with their
                favorite artists and creating unforgettable experiences.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Why Choose Us?</h2>
              <ul className="text-gray-300 space-y-2">
                <li>• Secure, encrypted ticket delivery with QR codes</li>
                <li>• Multiple payment options including Stripe, PayPal, Apple Pay, and Google Pay</li>
                <li>• Instant mobile wallet integration for Apple Wallet and Google Pay</li>
                <li>• 24/7 customer support</li>
                <li>• Guaranteed authentic tickets</li>
                <li>• Easy refund and exchange policies</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Our Technology</h2>
              <p className="text-gray-300 leading-relaxed">
                We use cutting-edge technology to ensure your ticket buying experience is smooth and secure.
                Our platform features crypto-signed QR codes for maximum security, real-time inventory
                management, and seamless integration with mobile wallets.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                Have questions? We'd love to hear from you. Reach out to our support team at{' '}
                <Link href="/contact" className="text-pink-400 hover:text-pink-300">
                  our contact page
                </Link>
                {' '}or email us directly at support@concerttickets.com.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}