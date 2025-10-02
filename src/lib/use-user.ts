import { useSession } from 'next-auth/react'

// Custom hook to replace Clerk's useUser
export function useUser() {
  const { data: session, status } = useSession()

  const isLoaded = status !== 'loading'
  const isSignedIn = !!session?.user

  const user = session?.user ? {
    id: session.user.id,
    emailAddresses: [{ emailAddress: session.user.email }],
    firstName: session.user.name?.split(' ')[0] || '',
    lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
    fullName: session.user.name || '',
    imageUrl: session.user.image || '',
    publicMetadata: { role: session.user.role || 'USER' }
  } : null

  return {
    isLoaded,
    isSignedIn,
    user
  }
}