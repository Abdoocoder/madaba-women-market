/**
 * Environment Configuration Validator
 * Helps diagnose configuration issues
 */

export function validateFirebaseConfig() {
  const issues = [];
  
  if (!process.env.FIREBASE_PROJECT_ID) {
    issues.push('FIREBASE_PROJECT_ID is missing');
  }
  
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    issues.push('FIREBASE_CLIENT_EMAIL is missing');
  }
  
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    issues.push('FIREBASE_PRIVATE_KEY is missing');
  } else {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      issues.push('FIREBASE_PRIVATE_KEY does not appear to be a valid private key format');
    }
    if (privateKey.includes('MIIEvAIBADANBGkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC5jZvQs6RZQ3tR')) {
      issues.push('FIREBASE_PRIVATE_KEY appears to be placeholder/sample data');
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

export function validateCloudinaryConfig() {
  const issues = [];
  
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    issues.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing');
  }
  
  if (!process.env.CLOUDINARY_API_KEY) {
    issues.push('CLOUDINARY_API_KEY is missing');
  }
  
  if (!process.env.CLOUDINARY_API_SECRET) {
    issues.push('CLOUDINARY_API_SECRET is missing');
  } else {
    const secret = process.env.CLOUDINARY_API_SECRET;
    if (secret === 'madaba-women-market-presets') {
      issues.push('CLOUDINARY_API_SECRET appears to be placeholder data - should be your actual Cloudinary API secret');
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

export function logConfigurationStatus() {
  // Only log detailed configuration status in development to avoid exposing sensitive info
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  console.log('\n🔧 Configuration Status:');
  console.log('========================');
  
  const firebaseStatus = validateFirebaseConfig();
  console.log('\n🔥 Firebase Admin:');
  if (firebaseStatus.isValid) {
    console.log('✅ Firebase configuration appears valid');
  } else {
    console.log('❌ Firebase configuration issues:');
    firebaseStatus.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  const cloudinaryStatus = validateCloudinaryConfig();
  console.log('\n🎨 Cloudinary:');
  if (cloudinaryStatus.isValid) {
    console.log('✅ Cloudinary configuration appears valid');
  } else {
    console.log('❌ Cloudinary configuration issues:');
    cloudinaryStatus.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  if (!firebaseStatus.isValid || !cloudinaryStatus.isValid) {
    console.log('\n📋 To fix these issues:');
    console.log('1. Check setup-credentials.sh for detailed instructions');
    console.log('2. Update your .env.local file with real credentials');
    console.log('3. Restart your development server');
  }
  
  console.log('========================\n');
}
