import { useSession } from 'next-auth/react'

// NextAuth-based user hook keeping a stable interface
export function useUser() {
  const { data, status } = useSession()
  const sessionUser = data?.user as any

  const mappedUser = sessionUser
    ? {
      id: sessionUser.id || sessionUser.sub || '',
      email: sessionUser.email,
      name: sessionUser.name,
      image: sessionUser.image,
      role: sessionUser.role || 'USER',
    }
    : null

  return {
    isLoaded: status !== 'loading',
    isSignedIn: status === 'authenticated',
    user: mappedUser,
  }
}