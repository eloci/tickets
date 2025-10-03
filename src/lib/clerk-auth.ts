import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './auth'

export type AppUser = {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  role?: string
}

export async function getAuthUser(): Promise<AppUser | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null
    const u: any = session.user
    return {
      id: u.id || u.sub || '',
      email: u.email,
      name: u.name,
      image: u.image,
      role: u.role || 'USER',
    }
  } catch (error) {
    console.error('[Auth] Error fetching current user:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getAuthUser()
  if (!user) redirect('/sign-in')
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (!user || (user.role || 'USER').toUpperCase() !== 'ADMIN') {
    redirect('/')
  }
  return user
}

// No server-side user directory to fetch by ID here; callers should query Mongo by email/authId
export async function getUserById(_id: string): Promise<AppUser | null> {
  const user = await getAuthUser()
  return user && (user.id === _id) ? user : null
}