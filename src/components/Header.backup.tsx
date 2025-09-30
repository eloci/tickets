'use client'

import Link from 'next/link'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, User, LogOut, ChevronDown, CreditCard, Calendar, Menu, X, Settings, Shield, BarChart3, Globe, FileText } from 'lucide-react'

export default function Header() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleNavigation = (path: string) => {
    setIsProfileOpen(false)
    router.push(path)
  }

  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Ticket className="h-8 w-8 text-pink-500" />
            <span className="text-2xl font-bold text-white">ConcertTix</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="text-gray-300 hover:text-white transition-colors">
              Events
            </Link>
            <Link href="/past-events" className="text-gray-300 hover:text-white transition-colors">
              Past Events
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
              Contact
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {!isLoaded ? (
              <div className="text-gray-300">Loading...</div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors focus:outline-none"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                  >
                    <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="hidden sm:block">{user.fullName || user.emailAddresses?.[0]?.emailAddress}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <>
                      {/* Backdrop for mobile */}
                      <div
                        className="fixed inset-0 z-[999] md:hidden"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] min-w-max">
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => handleNavigation('/profile')}
                          >
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-3" />
                              Profile Dashboard
                            </div>
                          </Link>
                          <Link
                            href="/profile/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => handleNavigation('/profile/orders')}
                          >
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-3" />
                              My Orders
                            </div>
                          </Link>
                          <Link
                            href="/events"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => handleNavigation('/events')}
                          >
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-3" />
                              Browse Events
                            </div>
                          </Link>

                          {/* Admin Menu Items - Only show for admin users */}
                          {user && user.publicMetadata?.role === 'admin' && (
                            <>
                              <hr className="my-1 border-gray-200" />
                              <div className="px-3 py-1">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Tools</span>
                              </div>
                              <Link
                                href="/admin"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <div className="flex items-center">
                                  <Shield className="h-4 w-4 mr-3" />
                                  Admin Dashboard
                                </div>
                              </Link>
                              <Link
                                href="/admin/events/create"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-3" />
                                  Create Event
                                </div>
                              </Link>
                              <Link
                                href="/admin/events"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => handleNavigation('/admin/events')}
                              >
                                <div className="flex items-center">
                                  <Settings className="h-4 w-4 mr-3" />
                                  Manage Events
                                </div>
                              </Link>
                              <Link
                                href="/admin/scan"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => handleNavigation('/admin/scan')}
                              >
                                <div className="flex items-center">
                                  <Ticket className="h-4 w-4 mr-3" />
                                  Scan QR Codes
                                </div>
                              </Link>
                              <Link
                                href="/admin/content/homepage"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => handleNavigation('/admin/content/homepage')}
                              >
                              >
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-3" />
                                  Homepage Content
                                </div>
                              </Link>
                              <Link
                                href="/admin/content/past-events"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setIsProfileOpen(false)
                                  window.location.href = '/admin/content/past-events'
                                }}
                              >
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-3" />
                                  Past Events
                                </div>
                              </Link>
                            </>
                          )}

                          <hr className="my-1 border-gray-200" />
                          <SignOutButton>
                            <button
                              onClick={() => setIsProfileOpen(false)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              type="button"
                            >
                              <div className="flex items-center">
                                <LogOut className="h-4 w-4 mr-3" />
                                Sign Out
                              </div>
                            </button>
                          </SignOutButton>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/sign-in"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 pt-4 pb-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/events"
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Events
                </Link>
                <Link
                  href="/past-events"
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Past Events
                </Link>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>

                {user ? (
                  <>
                    <hr className="border-white/10" />
                    <Link
                      href="/profile"
                      className="text-gray-300 hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile Dashboard
                    </Link>
                    <Link
                      href="/profile/orders"
                      className="text-gray-300 hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <SignOutButton>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-left text-gray-300 hover:text-white transition-colors"
                      >
                        Sign Out
                      </button>
                    </SignOutButton>
                  </>
                ) : (
                  <>
                    <hr className="border-white/10" />
                    <Link
                      href="/sign-in"
                      className="text-gray-300 hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}