import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your account</p>
        </div>
        'use client'

        import {signIn, getSession} from 'next-auth/react'
        import {useState, useEffect} from 'react'
        import {useRouter} from 'next/navigation'

        export default function SignInPage() {
  const [email, setEmail] = useState('')
        const [password, setPassword] = useState('')
        const [loading, setLoading] = useState(false)
        const router = useRouter()

  useEffect(() => {
          // Check if already signed in
          getSession().then((session) => {
            if (session) {
              router.push('/admin')
            }
          })
        }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
    setLoading(true)

        try {
      const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
      })

        if (result?.ok) {
          router.push('/admin')
        } else {
          alert('Invalid credentials')
        }
    } catch (error) {
          console.error('Sign in error:', error)
      alert('Sign in failed')
    } finally {
          setLoading(false)
        }
  }

        return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-300">Sign in to your account</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="admin@admin.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="admin"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white/70 text-sm">
                  Demo: Use admin@admin.com / admin
                </p>
              </div>
            </div>
          </div>
        </div>
        )
}
      </div>
    </div>
  )
}