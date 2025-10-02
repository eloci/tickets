'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, Shield, Key, ArrowLeft, Copy, Check } from 'lucide-react'

export default function DebugUserPage() {
  const { user, isLoaded } = useUser()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">User Debug Information</h1>
          <p className="text-gray-600 mt-2">Debug your user authentication and permissions</p>
        </div>

        {!user ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Not Signed In</h2>
              <p className="text-gray-600 mb-6">You need to sign in to access user information.</p>
              <Link
                href="/sign-in"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                User Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 text-sm rounded">{user.id}</code>
                    <button
                      onClick={() => copyToClipboard(user.id)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="px-3 py-2 bg-gray-100 text-sm rounded">
                    {user.fullName || 'Not set'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
                  <div className="px-3 py-2 bg-gray-100 text-sm rounded">
                    {user.primaryEmailAddress?.emailAddress || 'Not set'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="px-3 py-2 bg-gray-100 text-sm rounded">
                    {user.username || 'Not set'}
                  </div>
                </div>
              </div>
            </div>

            {/* Role & Permissions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Role & Permissions
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Public Metadata</label>
                  <pre className="px-3 py-2 bg-gray-100 text-sm rounded overflow-auto">
                    {JSON.stringify(user.publicMetadata, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Private Metadata</label>
                  <pre className="px-3 py-2 bg-gray-100 text-sm rounded overflow-auto">
                    {JSON.stringify(user.unsafeMetadata, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Status</label>
                  <div className={`px-3 py-2 text-sm rounded ${
                    user.publicMetadata?.role === 'admin' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.publicMetadata?.role === 'admin' ? '✅ Admin User' : '❌ Not Admin'}
                  </div>
                </div>
              </div>
            </div>

            {/* Access Test */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Access Test
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/profile"
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-center"
                  >
                    <h3 className="font-medium text-gray-900">Profile</h3>
                    <p className="text-sm text-gray-600">User area</p>
                  </Link>
                  
                  <Link
                    href="/admin"
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-center"
                  >
                    <h3 className="font-medium text-gray-900">Admin</h3>
                    <p className="text-sm text-gray-600">Admin area</p>
                  </Link>
                  
                  <Link
                    href="/events"
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-center"
                  >
                    <h3 className="font-medium text-gray-900">Events</h3>
                    <p className="text-sm text-gray-600">Public area</p>
                  </Link>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">To Get Admin Access:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Copy your User ID from above</li>
                <li>Go to your Clerk Dashboard</li>
                <li>Find your user account</li>
                <li>In the user&apos;s metadata, add: <code className="bg-blue-100 px-1 rounded">{`{"role": "admin"}`}</code></li>
                <li>Save the changes</li>
                <li>Sign out and sign back in</li>
                <li>Try accessing the admin panel again</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
