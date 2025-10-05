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
            return null;
        }

        const idToken = authHeader.split('Bearer ')[1];
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

// Alternative method for API routes that receive NextRequest
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
    try {
        const authHeader = request.headers.get('authorization');
        console.log('Auth header present:', !!authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No valid auth header found');
            return null;
        }

        const idToken = authHeader.split('Bearer ')[1];
        console.log('Attempting to verify token...');
        
        // Check if Firebase Admin is properly configured
        try {
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
            console.log('User role:', userData?.role);
            
            return {
                id: decodedToken.uid,
                email: decodedToken.email || '',
                name: userData?.name || decodedToken.name || 'Unknown User',
                photoURL: userData?.photoURL || decodedToken.picture || '',
                role: userData?.role || 'customer',
                createdAt: userData?.createdAt || new Date(),
            } as User;
        } catch (configError) {
            if (configError instanceof Error && configError.message.includes('Firebase Admin not configured')) {
                console.error('Firebase Admin not properly configured. Please check your environment variables.');
                console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
                return null;
            }
            throw configError;
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
        return null;
    }
}
