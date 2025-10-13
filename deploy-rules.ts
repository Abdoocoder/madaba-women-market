import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function deployRules() {
  try {
    console.log('Deploying Firestore rules...');
    
    // Check if Firebase CLI is installed
    try {
      await execAsync('firebase --version');
    } catch (error) {
      console.log('Firebase CLI not found. Installing...');
      await execAsync('npm install -g firebase-tools');
    }
    
    // Deploy Firestore rules
    const { stdout, stderr } = await execAsync('firebase deploy --only firestore:rules');
    
    if (stderr) {
      console.error('Error deploying rules:', stderr);
      return;
    }
    
    console.log('✅ Firestore rules deployed successfully');
    console.log(stdout);
    
  } catch (error) {
    console.error('❌ Error deploying Firestore rules:', error);
    console.log('Please make sure you are logged in to Firebase CLI:');
    console.log('1. Run: firebase login');
    console.log('2. Then run this script again');
  }
}

deployRules();
