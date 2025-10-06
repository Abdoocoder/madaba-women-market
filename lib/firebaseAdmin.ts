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
const hasFirebaseConfig = 
  process.env.FIREBASE_PROJECT_ID && 
  process.env.FIREBASE_CLIENT_EMAIL && 
  process.env.FIREBASE_PRIVATE_KEY;

// Function to initialize Firebase Admin
function initializeFirebaseAdmin() {
  // If already initialized, return the existing app
  if (firebaseApp) {
    return firebaseApp;
  }

  // If we don't have config or we're in browser, return null
  if (!hasFirebaseConfig || typeof window !== 'undefined') {
    console.log('⚠️ Firebase Admin not initialized - missing configuration or running in browser');
    return null;
  }

  try {
    // If there's already an app initialized, use it
    if (getApps().length > 0) {
      firebaseApp = getApps()[0];
      console.log('✅ Using existing Firebase Admin app');
      return firebaseApp;
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
    throw new Error('Firebase Admin not configured - check environment variables');
  }
  
  // Ensure app is initialized
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  
  if (!firebaseApp) {
    throw new Error('Firebase Admin not available - failed to initialize');
  }
  
  try {
    return getAuth(firebaseApp);
  } catch (error) {
    console.error('❌ Error getting Firebase Admin Auth:', error);
    throw new Error('Firebase Admin Auth not available');
  }
}

export function getAdminDb() {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase Admin not configured - check environment variables');
  }
  
  // Ensure app is initialized
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  
  if (!firebaseApp) {
    throw new Error('Firebase Admin not available - failed to initialize');
  }
  
  try {
    return getFirestore(firebaseApp);
  } catch (error) {
    console.error('❌ Error getting Firebase Admin Firestore:', error);
    throw new Error('Firebase Admin Firestore not available');
  }
}

// Legacy exports for backward compatibility - these will be null during build
export const adminAuth = hasFirebaseConfig && firebaseApp ? getAuth(firebaseApp) : null;
export const adminDb = hasFirebaseConfig && firebaseApp ? getFirestore(firebaseApp) : null;
