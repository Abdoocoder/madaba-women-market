import 'server-only';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { logConfigurationStatus } from './config-validator';

// Log configuration status on server startup
if (typeof window === 'undefined') {
  logConfigurationStatus();
}

// Check if we have the required environment variables
const hasFirebaseConfig = 
  process.env.FIREBASE_PROJECT_ID && 
  process.env.FIREBASE_CLIENT_EMAIL && 
  process.env.FIREBASE_PRIVATE_KEY;

// Only initialize Firebase Admin if we have the config and we're not in build mode
if (!getApps().length && hasFirebaseConfig && typeof window === 'undefined') {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.warn('Firebase Admin initialization failed during build:', error);
  }
}

// Safe getter functions that won't fail during build
export function getAdminAuth() {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase Admin not configured - check environment variables');
  }
  try {
    return getAuth();
  } catch (error) {
    throw new Error('Firebase Admin Auth not available');
  }
}

export function getAdminDb() {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase Admin not configured - check environment variables');
  }
  try {
    return getFirestore();
  } catch (error) {
    throw new Error('Firebase Admin Firestore not available');
  }
}

// Legacy exports for backward compatibility - these will be null during build
export const adminAuth = hasFirebaseConfig && getApps().length > 0 ? getAuth() : null;
export const adminDb = hasFirebaseConfig && getApps().length > 0 ? getFirestore() : null;
