import Link from 'next/link'

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Terms & Conditions</h1>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-8">
            <div>
              <p className="text-gray-300 mb-4">
                <strong>Last updated:</strong> September 29, 2025
              </p>
              <p className="text-gray-300 leading-relaxed">
                Welcome to Concert Tickets. These Terms and Conditions ("Terms") govern your use of our
                platform and services. By accessing or using our service, you agree to be bound by these Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By creating an account or using our services, you acknowledge that you have read,
                understood, and agree to these Terms and our Privacy Policy. If you do not agree,
                please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Ticket Purchases</h2>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li>All ticket sales are final unless otherwise stated</li>
                <li>Tickets are non-transferable except through our official platform</li>
                <li>You must be 18 years or older to purchase tickets</li>
                <li>Prices are subject to change without notice</li>
                <li>We reserve the right to limit ticket quantities per customer</li>
                <li>Event dates and venues may change; refunds will be offered if cancelled</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">QR Code Tickets</h2>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li>QR codes are unique and secure; do not share with unauthorized parties</li>
                <li>Screenshots or copies of QR codes may not be accepted at venues</li>
                <li>Lost or deleted tickets can be resent to your registered email</li>
                <li>QR codes expire 24 hours after the event end time</li>
                <li>We are not responsible for fraudulent or duplicated tickets</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">User Accounts</h2>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li>You are responsible for maintaining account security</li>
                <li>Provide accurate and current information</li>
                <li>One account per person; sharing accounts is prohibited</li>
                <li>We may suspend accounts for violations of these Terms</li>
                <li>You must notify us immediately of any unauthorized access</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Refunds and Cancellations</h2>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li>Refunds are available if events are cancelled by organizers</li>
                <li>No refunds for change of mind or inability to attend</li>
                <li>Refund processing may take 5-10 business days</li>
                <li>Fees and charges may not be refundable</li>
                <li>Event postponements do not automatically qualify for refunds</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Prohibited Activities</h2>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li>Using bots or automated systems to purchase tickets</li>
                <li>Reselling tickets above face value (scalping)</li>
                <li>Creating multiple accounts to circumvent purchase limits</li>
                <li>Using false or misleading information</li>
                <li>Attempting to hack or disrupt our services</li>
                <li>Using our platform for illegal activities</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                Concert Tickets shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, including loss of profits, data, or use,
                arising from your use of our services, even if we have been advised of the
                possibility of such damages.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users
                of significant changes via email or platform notifications. Continued use of
                our services after changes constitutes acceptance of the new Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                For questions about these Terms, please contact us at{' '}
                <Link href="/contact" className="text-pink-400 hover:text-pink-300">
                  our contact page
                </Link>
                {' '}or email legal@concerttickets.com.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}