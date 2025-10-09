import 'server-only';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { logConfigurationStatus } from './config-validator';

let firebaseApp: App | null = null;

// Log configuration status on server startup
if (typeof window === 'undefined') {
  logConfigurationStatus();
}

// Check if we have the required environment variables
// Also check if we're in a server context (not client)
const hasFirebaseConfig = 
  typeof window === 'undefined' &&
  process.env.FIREBASE_PROJECT_ID && 
  process.env.FIREBASE_CLIENT_EMAIL && 
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_PRIVATE_KEY !== '-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n';

// Function to initialize Firebase Admin
function initializeFirebaseAdmin() {
  // If already initialized, return the existing app
  if (firebaseApp) {
    return firebaseApp;
  }

  // If we don't have config or we're in browser, return null
  if (!hasFirebaseConfig || typeof window !== 'undefined') {
    if (!hasFirebaseConfig) {
      console.log('⚠️ Firebase Admin not initialized - missing or invalid configuration');
      // Only log detailed info in development to avoid exposing env vars in production
      if (process.env.NODE_ENV === 'development') {
        console.log('FIREBASE_PROJECT_ID exists:', !!process.env.FIREBASE_PROJECT_ID);
        console.log('FIREBASE_CLIENT_EMAIL exists:', !!process.env.FIREBASE_CLIENT_EMAIL);
        console.log('FIREBASE_PRIVATE_KEY exists and valid:', !!(process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY !== '-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n'));
      }
    } else {
      console.log('⚠️ Firebase Admin not initialized - running in browser');
    }
    return null;
  }

  try {
    // If there's already an app initialized, use it
    if (getApps().length > 0) {
      firebaseApp = getApps()[0];
      console.log('✅ Using existing Firebase Admin app');
      return firebaseApp;
    }

    // Check if required environment variables are present
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error('❌ Missing required Firebase Admin environment variables');
      return null;
    }

    // Initialize new app
    firebaseApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    return null;
  }
}

// Initialize Firebase Admin immediately
initializeFirebaseAdmin();

// Safe getter functions that won't fail during build
export function getAdminAuth() {
  if (!hasFirebaseConfig) {
    console.error('Firebase Admin not configured - check environment variables');
    throw new Error('Firebase Admin not configured - check environment variables. Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set correctly in your .env.local file.');
  }
  
  // Ensure app is initialized
  if (!firebaseApp) {
    const initResult = initializeFirebaseAdmin();
    if (!initResult) {
      console.error('Firebase Admin not available - failed to initialize');
      throw new Error('Firebase Admin not available - failed to initialize. Check your Firebase Admin credentials.');
    }
  }
  
  if (!firebaseApp) {
    console.error('Firebase Admin not available - failed to initialize');
    throw new Error('Firebase Admin not available - failed to initialize');
  }
  
  try {
    return getAuth(firebaseApp);
  } catch (error) {
    console.error('❌ Error getting Firebase Admin Auth:', error);
    throw new Error('Firebase Admin Auth not available: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export function getAdminDb() {
  if (!hasFirebaseConfig) {
    console.error('Firebase Admin not configured - check environment variables');
    throw new Error('Firebase Admin not configured - check environment variables. Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set correctly in your .env.local file.');
  }
  
  // Ensure app is initialized
  if (!firebaseApp) {
    const initResult = initializeFirebaseAdmin();
    if (!initResult) {
      console.error('Firebase Admin not available - failed to initialize');
      throw new Error('Firebase Admin not available - failed to initialize. Check your Firebase Admin credentials.');
    }
  }
  
  if (!firebaseApp) {
    console.error('Firebase Admin not available - failed to initialize');
    throw new Error('Firebase Admin not available - failed to initialize');
  }
  
  try {
    return getFirestore(firebaseApp);
  } catch (error) {
    console.error('❌ Error getting Firebase Admin Firestore:', error);
    throw new Error('Firebase Admin Firestore not available: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Legacy exports for backward compatibility - these will be null during build
export const adminAuth = hasFirebaseConfig && firebaseApp ? getAuth(firebaseApp) : null;
export const adminDb = hasFirebaseConfig && firebaseApp ? getFirestore(firebaseApp) : null;
