import { headers } from "next/headers";
import { getAdminAuth, getAdminDb } from "./firebaseAdmin";
import { User } from "./types";
import { NextRequest } from "next/server";

// Unified function to verify Firebase ID token and get user data
async function verifyTokenAndGetUser(idToken: string): Promise<User | null> {
    try {
        // Ensure Firebase Admin is initialized
        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();
        
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        
        // Get user data from Firestore
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        
        if (!userDoc.exists) {
            return null;
        }

        const userData = userDoc.data();
        
        return {
            id: decodedToken.uid,
            email: decodedToken.email || '',
            name: userData?.name || decodedToken.name || 'Unknown User',
            photoURL: userData?.photoURL || decodedToken.picture || '',
            role: userData?.role || 'customer',
            createdAt: userData?.createdAt || new Date(),
        } as User;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

// Get user from Firebase ID token (for Server Components)
export async function getServerUser(): Promise<User | null> {
    try {
        const headersList = await headers();
        const authHeader = headersList.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const idToken = authHeader.split('Bearer ')[1];
        return await verifyTokenAndGetUser(idToken);
    } catch (error) {
        console.error('Error in getServerUser:', error);
        return null;
    }
}

// Get user from Firebase ID token (for API routes)
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const idToken = authHeader.split('Bearer ')[1];
        return await verifyTokenAndGetUser(idToken);
    } catch (error) {
        console.error('Error in getAuthenticatedUser:', error);
        return null;
    }
}
