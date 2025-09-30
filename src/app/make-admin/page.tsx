'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function MakeAdminPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const makeAdmin = async () => {
    if (!user?.id) {
      toast.error('Please sign in first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          role: 'ADMIN'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      toast.success('You are now an admin!')
      router.push('/admin')
    } catch (error) {
      toast.error('Failed to update role')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in first</h1>
          <a href="/auth/signin" className="text-blue-600 hover:text-blue-700">
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Setup</h1>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Current User: <span className="font-semibold">{user?.emailAddresses?.[0]?.emailAddress}</span>
          </p>

          <div>
              <p className="text-gray-600 mb-4">
                Click the button below to make yourself an admin for testing purposes.
              </p>
              <button
                onClick={makeAdmin}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Make Me Admin'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Note: In production, admin roles should be assigned through a secure process.
              </p>
            </div>
        </div>
      </div>
    </div>
  )
}