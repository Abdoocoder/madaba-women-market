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

  console.log("🔥 Firebase Configuration Check:");
  
  const missingVars: string[] = [];
  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
      console.error(`❌ Missing: ${key}`);
    } else {
      console.log(`✅ ${key}: ${value.substring(0, 10)}...`);
    }
  });

  if (missingVars.length > 0) {
    console.error("🚨 Missing Firebase environment variables:", missingVars);
    console.log("💡 Please check your .env.local file and ensure all Firebase variables are set.");
    return false;
  } else {
    console.log("✅ All Firebase environment variables are configured!");
    return true;
  }
}