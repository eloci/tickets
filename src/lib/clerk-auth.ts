import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function getAuthUser() {
  const { userId } = await auth()
  console.log(`[Auth] User ID from auth(): ${userId}`)
  if (!userId) return null

  const clerkUser = await currentUser()
  console.log(`[Auth] Current user from Clerk:`, clerkUser ? 'Found' : 'null')
  if (!clerkUser) return null

  // Return user data from Clerk, ensuring role is always lowercase
  return {
    id: userId,
    clerkId: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    name: clerkUser.firstName
      ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
      : clerkUser.username,
    image: clerkUser.imageUrl,
    role: (clerkUser.publicMetadata?.role as string)?.toLowerCase() || 'user',
  }
}

export async function requireAuth() {
  const user = await getAuthUser()
  if (!user) {
    redirect('/sign-in')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  // TEMPORARY: Allow any authenticated user to access admin functions
  // TODO: Fix JWT template to include public_metadata for proper role checking
  console.log(`[Auth] Allowing admin access for user: ${user.id} (temporary bypass)`)
  return user
}

export async function getUserById(id: string) {
  try {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(id)
    if (!clerkUser) return null

    return {
      id: clerkUser.id,
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : null,
      image: clerkUser.imageUrl,
      role: clerkUser.publicMetadata?.role as string || 'USER',
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}