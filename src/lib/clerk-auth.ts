import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'

export async function getAuthUser() {
  console.log('[Auth] Getting authenticated user...')
  
  const session = await getServerSession(authOptions)
  console.log(`[Auth] Session from NextAuth:`, session?.user ? 'Found' : 'null')
  
  if (!session?.user) return null
  
  return {
    id: session.user.id,
    clerkId: session.user.id, // Keep clerkId for compatibility
    email: session.user.email || '',
    name: session.user.name || 'Unknown',
    image: session.user.image,
    role: (session.user.role || 'user').toLowerCase(),
  }
}

export async function requireAuth() {
  const user = await getAuthUser()
  if (!user) {
    redirect('/auth/signin')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  // For now, allow any authenticated user to access admin functions
  // TODO: Implement proper role checking
  console.log(`[Auth] Allowing admin access for user: ${user.id}`)
  return user
}

export async function getUserById(id: string) {
  // TODO: Implement database lookup
  // For now, return user if ID matches current session
  const session = await getServerSession(authOptions)
  if (session?.user?.id === id) {
    return {
      id: session.user.id,
      clerkId: session.user.id,
      email: session.user.email || '',
      name: session.user.name || 'Unknown',
      image: session.user.image,
      role: session.user.role || 'USER',
    }
  }
  return null
}