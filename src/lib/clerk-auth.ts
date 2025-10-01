import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function getAuthUser() {
  const { userId } = await auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  // Return user data from Clerk without MongoDB
  return {
    id: userId,
    clerkId: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : null,
    image: clerkUser.imageUrl,
    role: clerkUser.publicMetadata?.role as string || 'USER',
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
  if (user.role !== 'ADMIN') {
    redirect('/')
  }
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