import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function checkApiAuth() {
  const { userId } = auth();

  if (!userId) {
    return {
      authenticated: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  try {
    const user = await currentUser();

    if (!user) {
      return {
        authenticated: false,
        response: NextResponse.json({ error: 'User not found' }, { status: 404 }),
      };
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
        image: user.imageUrl,
        role: user.publicMetadata?.role || 'USER',
      },
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      authenticated: false,
      response: NextResponse.json({ error: 'Authentication error' }, { status: 500 }),
    };
  }
}

export function requireAuth() {
  const { userId } = auth();

  if (!userId) {
    throw new Error('Unauthorized: Authentication required');
  }

  return userId;
}

export async function requireAdmin() {
  const userId = requireAuth();

  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('User not found');
    }

    const role = user.publicMetadata?.role as string;

    if (role !== 'ADMIN') {
      throw new Error('Forbidden: Admin access required');
    }

    return userId;
  } catch (error) {
    console.error('Error checking admin status:', error);
    throw new Error('Authentication error');
  }
}

export function getUserId() {
  const { userId } = auth();
  return userId;
}