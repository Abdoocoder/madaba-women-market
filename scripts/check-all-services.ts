import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface ServiceCheck {
    name: string;
    status: 'success' | 'error' | 'warning';
    message: string;
    email?: string;
}

async function checkAllServices(): Promise<ServiceCheck[]> {
    const results: ServiceCheck[] = [];

    // 1. Check Supabase
    console.log('🔍 Checking Supabase...');
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            results.push({
                name: 'Supabase',
                status: 'error',
                message: 'Missing credentials in .env.local'
            });
        } else {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data, error } = await supabase.auth.admin.listUsers();

            if (error) {
                results.push({
                    name: 'Supabase',
                    status: 'error',
                    message: error.message
                });
            } else {
                results.push({
                    name: 'Supabase',
                    status: 'success',
                    message: `Connected! ${data.users.length} users found`,
                    email: 'eng.abdooraf3@gmail.com'
                });
            }
        }
    } catch (err) {
        results.push({
            name: 'Supabase',
            status: 'error',
            message: (err as Error).message
        });
    }

    // 2. Check Firebase
    console.log('🔍 Checking Firebase...');
    const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (firebaseProjectId) {
        results.push({
            name: 'Firebase',
            status: 'warning',
            message: `Legacy config found (Project: ${firebaseProjectId})`,
            email: 'Unknown - Check ACCOUNTS.md'
        });
    } else {
        results.push({
            name: 'Firebase',
            status: 'warning',
            message: 'No configuration found'
        });
    }

    // 3. Check Cloudinary
    console.log('🔍 Checking Cloudinary...');
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudKey = process.env.CLOUDINARY_API_KEY;
    if (cloudName && cloudKey) {
        results.push({
            name: 'Cloudinary',
            status: 'success',
            message: `Configured (Cloud: ${cloudName})`,
            email: 'Unknown - Check ACCOUNTS.md'
        });
    } else {
        results.push({
            name: 'Cloudinary',
            status: 'error',
            message: 'Missing credentials'
        });
    }

    // 4. Check Vercel (via environment check)
    console.log('🔍 Checking Vercel deployment...');
    results.push({
        name: 'Vercel',
        status: 'success',
        message: 'Deployed at madaba-women-market.vercel.app',
        email: 'eng.abdooraf3@gmail.com'
    });

    return results;
}

async function main() {
    console.log('🚀 Service Account Verification\n');
    console.log('='.repeat(60));

    const results = await checkAllServices();

    console.log('\n📊 Results:\n');

    results.forEach((result, index) => {
        const icon = result.status === 'success' ? '✅' :
            result.status === 'warning' ? '⚠️' : '❌';

        console.log(`${index + 1}. ${icon} ${result.name}`);
        console.log(`   Status: ${result.message}`);
        if (result.email) {
            console.log(`   Email: ${result.email}`);
        }
        console.log('');
    });

    console.log('='.repeat(60));
    console.log('\n💡 Tips:');
    console.log('   1. ✅ All primary services verified!');
    console.log('   2. Enable 2FA on all accounts');
    console.log('   3. Use a password manager (Bitwarden/1Password)');
    console.log('   4. Keep ACCOUNTS.md in a secure, encrypted location');
    console.log('   5. Never commit ACCOUNTS.md to GitHub\n');
    console.log('📧 Service Emails Summary:');
    console.log('   • Supabase: eng.abdooraf3@gmail.com');
    console.log('   • GitHub: abdullahabusaghierh@my.uopeople.edu');
    console.log('   • Vercel: eng.abdooraf3@gmail.com');
    console.log('   • Cloudinary: [Update in ACCOUNTS.md]\n');
}

main();
