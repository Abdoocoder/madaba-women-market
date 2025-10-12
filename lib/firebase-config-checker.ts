// Firebase Configuration Checker
// This file helps debug Firebase configuration issues

export function checkFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Only log in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const missingVars: string[] = [];
  Object.entries(config).forEach(([key, value]) => {
    if (!value || value.includes('your-') || value === 'undefined') {
      missingVars.push(key);
      if (isDevelopment) {
        console.error(`❌ Missing or placeholder Firebase config: ${key}`);
      }
    }
  });

  if (missingVars.length > 0) {
    if (isDevelopment) {
      console.error("🚨 Missing or placeholder Firebase environment variables:", missingVars);
      console.log("💡 Please check your .env.local file and ensure all Firebase variables are set with actual values from your Firebase project.");
      console.log("💡 Run the setup-credentials.sh script or check the Firebase console for your project settings.");
    }
    return false;
  } else {
    if (isDevelopment) {
      console.log("✅ Firebase configuration loaded successfully");
    }
    return true;
  }
}