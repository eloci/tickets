'use client'

import { useState } from 'react'

export default function TestEmailPage() {
  const [email, setEmail] = useState('enigray05@gmail.com')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSendTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      let data
      try {
        data = await response.json()
      } catch (e) {
        data = { error: `HTTP ${response.status}: ${response.statusText}` }
      }

      setResult({
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (error) {
      setResult({ error: 'Network error: ' + (error as Error).message })
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Email Integration Test</h1>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Test Email Address:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter email address"
          />
        </div>

        <button
          onClick={handleSendTest}
          disabled={loading || !email}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>

        {result && (
          <div className={`p-4 rounded ${result.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <h3 className="font-semibold mb-2">Response Details:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Brevo Configuration Status:</h2>
          <ul className="text-sm space-y-1">
            <li>✅ SMTP Host: smtp-relay.brevo.com</li>
            <li>✅ SMTP Port: 587</li>
            <li>✅ SMTP User: 97cf88001@smtp-brevo.com</li>
            <li>✅ Sender Email: enigray05@gmail.com</li>
            <li>✅ Environment: .env.local configured</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Troubleshooting:</h3>
          <p className="text-sm text-gray-700">
            If you're getting a 400 error, this might be due to:
          </p>
          <ul className="text-sm text-gray-700 mt-2 space-y-1">
            <li>• Next.js middleware interference</li>
            <li>• Email module import issues</li>
            <li>• SMTP authentication problems</li>
            <li>• Environment variable loading issues</li>
          </ul>
        </div>
      </div>
    </div>
  )
}