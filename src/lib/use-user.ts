import { useUser as useClerkUser } from '@clerk/nextjs'

// Custom hook that provides a consistent interface regardless of auth provider
export function useUser() {
  const { user, isLoaded } = useClerkUser()

  const isSignedIn = !!user

  // If using Clerk, return the user data in a format compatible with our app
  // This maintains backward compatibility with code expecting the previous structure
  const mappedUser = user ? {
    id: user.id,
    emailAddresses: user.emailAddresses,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    fullName: user.fullName || '',
    imageUrl: user.imageUrl || '',
    publicMetadata: user.publicMetadata || { role: 'USER' }
  } : null

  return {
    isLoaded,
    isSignedIn,
    user: mappedUser
  }
}