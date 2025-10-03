import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function checkApiAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { authenticated: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const u: any = session.user
  return {
    authenticated: true,
    user: {
      id: u.id || u.sub || '',
      email: u.email,
      name: u.name,
      image: u.image,
      role: u.role || 'USER',
    },
  }
}

export function requireAuth() {
  throw new Error('Use checkApiAuth() in API routes to enforce authentication')
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!role || role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }
  return (session?.user as any)?.id
}

export function getUserId() {
  return undefined
}