'use client'

import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { QRScanner } from '@/components/admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminScanPage() {
  const { data: session, status } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }

    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      setIsAdmin(true)
    } else if (status === 'authenticated') {
      // User is authenticated but not an admin
      redirect('/')
    }
  }, [session, status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-lg">
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/admin"
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Admin Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Scan Tickets</h1>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl">
          <QRScanner />
        </div>
      </div>
    </div>
  )
}