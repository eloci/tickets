import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import connectDB from './database'
import { User } from './schemas'

export async function getAuthUser() {
  const { userId } = await auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  await connectDB()
  let dbUser = await User.findOne({ clerkId: userId }).lean()

  if (!dbUser) {
    dbUser = await User.create({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : null,
      image: clerkUser.imageUrl,
    })
  }

  return {
    id: dbUser._id.toString(),
    clerkId: dbUser.clerkId,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image,
    role: dbUser.role,
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
  await connectDB()
  const user = await User.findById(id).lean()
  if (!user) return null
  
  return {
    id: user._id.toString(),
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
  }
}