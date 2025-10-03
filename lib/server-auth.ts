'use server'
import type { NextRequest } from 'next/server'

// In a real Firebase project, you would use firebase-admin to verify the token.
// Example: import { getAuth } from 'firebase-admin/auth';

// This is a mock user database for demonstration. 
// In a real app, this info would be stored securely in your database.
const MOCK_USERS: { [key: string]: { uid: string; name: string; role: string } } = {
  'token-for-user-1': { uid: 'user-1', name: 'أحمد محمود', role: 'customer' },
  'token-for-user-2': { uid: 'user-2', name: 'فاطمة الزهراء', role: 'seller' },
  'token-for-user-3': { uid: 'user-3', name: 'علي حسن', role: 'admin' },
}

interface AuthenticatedUser {
  uid: string
  name: string
  role: string
}

/**
 * A mock function to simulate verifying a Firebase ID token from the request headers.
 * In a real app, this would involve using the Firebase Admin SDK to decode and verify the token.
 * 
 * @param request The incoming Next.js request object.
 * @returns The authenticated user's data or null if unauthorized.
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('Missing or invalid Authorization header.')
    return null
  }

  const token = authHeader.split(' ')[1]

  // In a real app, you would verify the token here, e.g.:
  // try {
  //   const decodedToken = await getAuth().verifyIdToken(token);
  //   // You might want to fetch additional user details (like role) from your DB
  //   const user = await yourDB.findUser(decodedToken.uid);
  //   return user;
  // } catch (error) {
  //   console.error('Authentication error:', error);
  //   return null;
  // }

  // For this demo, we'll use a simple mock lookup.
  const user = MOCK_USERS[token]
  if (user) {
    return user
  }

  console.warn('Invalid token provided.')
  return null
}
