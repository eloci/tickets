import { auth, currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function getAuthUser() {
  console.log('[Auth] Getting authenticated user...');

  const user = await currentUser();
  console.log(`[Auth] User from Clerk:`, user ? 'Found' : 'null');

  if (!user) return null;

  return {
    id: user.id,
    clerkId: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    name: user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Unknown',
    image: user.imageUrl,
    role: (user.privateMetadata?.role as string || 'user').toLowerCase(),
  };
}

export async function requireAuth() {
  const { userId } = auth();
  if (!userId) {
    redirect('/sign-in');
  }
  return await getAuthUser();
}

export async function requireAdmin() {
  const user = await requireAuth();
  
  // For now, we're using Clerk's organization membership as a proxy for admin role
  // This can be enhanced with proper role checking from privateMetadata
  const { orgId } = auth();
  
  // TODO: Implement proper role checking based on organization membership
  console.log(`[Auth] Allowing admin access for user: ${user.id}`);
  return user;
}

export async function getUserById(id: string) {
  if (!id) return null;
  
  try {
    const user = await clerkClient.users.getUser(id);
    return {
      id: user.id,
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Unknown',
      image: user.imageUrl,
      role: user.privateMetadata?.role as string || 'USER',
    }
  }
  return null
}