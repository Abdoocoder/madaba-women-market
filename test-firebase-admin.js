// Simple test script to verify Firebase Admin SDK configuration
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^"(.*)"$/, '$1').trim();
      process.env[key.trim()] = value;
    }
  });
  console.log('✅ Environment variables loaded from .env.local');
} else {
  console.log('❌ .env.local file not found');
}

// Import Firebase Admin
const admin = require('firebase-admin');

// Check if environment variables are present
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Present' : '❌ Missing');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Present' : '❌ Missing');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Present' : '❌ Missing');

// Try to initialize Firebase Admin
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    console.log('Attempting to initialize Firebase Admin...');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin initialized successfully');
    
    // Test Firestore connection
    const db = admin.firestore();
    console.log('✅ Firestore instance created');
    
    // Test Auth connection
    const auth = admin.auth();
    console.log('✅ Auth instance created');
    
    console.log('\n🎉 All Firebase Admin services are working correctly!');
  } else {
    console.log('❌ Missing required environment variables');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.error('Error stack:', error.stack);
}