import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { User } from '../types';

export async function getAuthUser(): Promise<User | null> {
  try {
    const user = await currentUser();
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
      image: user.imageUrl,
      role: (user.privateMetadata?.role as string || 'user').toLowerCase(),
    };
  } catch (error) {
    console.error('[Auth] Error fetching current user:', error);
    return null;
  }
}

export async function requireAuth() {
  const { userId } = auth();
  if (!userId) {
    redirect('/sign-in');
  }
  const user = await getAuthUser();
  if (!user) {
    redirect('/sign-in');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const { orgId } = auth();

  if (user) {
    console.log(`[Auth] Allowing admin access for user: ${user.id}`);
  }
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await clerkClient.users.getUser(id);
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
      image: user.imageUrl,
      role: (user.privateMetadata?.role as string || 'user').toLowerCase(),
    };
  } catch (error) {
    console.error(`[Auth] Error fetching user by ID ${id}:`, error);
    return null;
  }
}