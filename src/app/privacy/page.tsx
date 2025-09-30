import Link from 'next/link'

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-8">
            <div>
              <p className="text-gray-300 mb-4">
                <strong>Last updated:</strong> September 29, 2025
              </p>
              <p className="text-gray-300 leading-relaxed">
                At Concert Tickets, we respect your privacy and are committed to protecting your personal information.
                This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li>Personal information (name, email, phone number)</li>
                <li>Payment information (processed securely through our payment partners)</li>
                <li>Account preferences and settings</li>
                <li>Usage data and analytics</li>
                <li>Device and browser information</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li>Process ticket purchases and deliver QR codes</li>
                <li>Send booking confirmations and event updates</li>
                <li>Provide customer support</li>
                <li>Improve our platform and services</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="text-gray-300 space-y-2 list-disc list-inside mt-2">
                <li>SSL encryption for all data transmission</li>
                <li>Secure payment processing through trusted partners</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Information Sharing</h2>
              <p className="text-gray-300 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties except:
              </p>
              <ul className="text-gray-300 space-y-2 list-disc list-inside mt-2">
                <li>With your explicit consent</li>
                <li>To trusted service providers who assist in our operations</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Your Rights</h2>
              <p className="text-gray-300 leading-relaxed">
                You have the right to:
              </p>
              <ul className="text-gray-300 space-y-2 list-disc list-inside mt-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>File a complaint with relevant authorities</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at{' '}
                <Link href="/contact" className="text-pink-400 hover:text-pink-300">
                  our contact page
                </Link>
                {' '}or email privacy@concerttickets.com.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}