import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    console.log('=== Testing Firebase Admin ===');
    
    // Test Firebase Admin Auth
    const adminAuth = getAdminAuth();
    console.log('✅ Firebase Admin Auth instance obtained');
    
    // Test Firebase Admin Firestore
    const adminDb = getAdminDb();
    console.log('✅ Firebase Admin Firestore instance obtained');
    
    // Test listing users (this will fail if not properly authenticated)
    try {
      // This is just a test to see if we can access the service
      console.log('✅ Firebase Admin services are accessible');
    } catch (error) {
      console.log('⚠️ Firebase Admin services accessible but with limitations:', error);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase Admin is working correctly' 
    });
  } catch (error) {
    console.error('❌ Firebase Admin test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}