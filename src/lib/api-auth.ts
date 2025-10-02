import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'

export async function checkApiAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return {
      authenticated: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }
  
  return {
    authenticated: true,
    user: session.user
  }
}