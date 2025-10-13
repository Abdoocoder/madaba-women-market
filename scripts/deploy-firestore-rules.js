const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function deployFirestoreRules() {
  try {
    console.log('🔍 Checking Firebase CLI installation...');
    
    // Check if Firebase CLI is installed
    try {
      const { stdout } = await execAsync('firebase --version');
      console.log(`✅ Firebase CLI version: ${stdout.trim()}`);
    } catch (error) {
      console.log('❌ Firebase CLI not found.');
      console.log('Please install Firebase CLI by running: npm install -g firebase-tools');
      return;
    }
    
    console.log('🚀 Deploying Firestore rules...');
    
    // Deploy Firestore rules
    const { stdout, stderr } = await execAsync('firebase deploy --only firestore:rules', {
      cwd: process.cwd()
    });
    
    if (stderr) {
      console.error('❌ Error deploying rules:', stderr);
      return;
    }
    
    console.log('✅ Firestore rules deployed successfully!');
    console.log(stdout);
    
  } catch (error) {
    console.error('❌ Error deploying Firestore rules:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure you are logged in to Firebase CLI: firebase login');
    console.log('2. Make sure you are in the correct project directory');
    console.log('3. Check that your Firebase project is properly configured');
  }
}

deployFirestoreRules();