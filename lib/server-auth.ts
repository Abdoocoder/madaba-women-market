import { cookies, headers } from "next/headers";
import { getAdminAuth, getAdminDb } from "./firebaseAdmin";
import { User } from "./types";
import { NextRequest } from "next/server";

// Get user from Firebase ID token
export async function getServerUser(): Promise<User | null> {
    try {
        const headersList = await headers();
        const authHeader = headersList.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No valid auth header found in getServerUser');
            return null;
        }

        const idToken = authHeader.split('Bearer ')[1];
        
        // Ensure Firebase Admin is initialized
        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();
        
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        console.log('Token verified for user (getServerUser):', decodedToken.uid);
        
        // Get user data from Firestore
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        
        if (!userDoc.exists) {
            console.log('User document not found in Firestore (getServerUser):', decodedToken.uid);
            return null;
        }

        const userData = userDoc.data();
        console.log('User data retrieved (getServerUser):', {
            id: decodedToken.uid,
            email: decodedToken.email,
            name: userData?.name,
            role: userData?.role
        });
        
        return {
            id: decodedToken.uid,
            email: decodedToken.email || '',
            name: userData?.name || decodedToken.name || 'Unknown User',
            photoURL: userData?.photoURL || decodedToken.picture || '',
            role: userData?.role || 'customer',
            createdAt: userData?.createdAt || new Date(),
        } as User;
    } catch (error) {
        console.error('Error verifying token in getServerUser:', error);
        return null;
    }
}

// Alternative method for API routes that receive NextRequest
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
    try {
        const authHeader = request.headers.get('authorization');
        console.log('=== getAuthenticatedUser called ===');
        console.log('Auth header present:', !!authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No valid auth header found in getAuthenticatedUser');
            return null;
        }

        const idToken = authHeader.split('Bearer ')[1];
        console.log('Attempting to verify token...');
        
        // Ensure Firebase Admin is initialized
        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();
        
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        console.log('Token verified for user:', decodedToken.uid);
        
        // Get user data from Firestore
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        
        if (!userDoc.exists) {
            console.log('User document not found in Firestore:', decodedToken.uid);
            return null;
        }

        const userData = userDoc.data();
        console.log('User data retrieved:', {
            id: decodedToken.uid,
            email: decodedToken.email,
            name: userData?.name,
            role: userData?.role
        });
        
        return {
            id: decodedToken.uid,
            email: decodedToken.email || '',
            name: userData?.name || decodedToken.name || 'Unknown User',
            photoURL: userData?.photoURL || decodedToken.picture || '',
            role: userData?.role || 'customer',
            createdAt: userData?.createdAt || new Date(),
        } as User;
    } catch (error) {
        console.error('Error verifying token in getAuthenticatedUser:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
        return null;
    }
}
