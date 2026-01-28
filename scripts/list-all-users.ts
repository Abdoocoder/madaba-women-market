import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllUsers() {
    console.log('🔍 Fetching all users from Supabase...\n');
    
    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
            console.error('❌ Error:', error.message);
            return;
        }
        
        if (!users || users.length === 0) {
            console.log('⚠️ No users found in this Supabase project.');
            return;
        }
        
        console.log(`✅ Found ${users.length} user(s):\n`);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email || 'N/A'}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
            console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
            console.log('   ---');
        });
        
    } catch (err) {
        console.error('💥 Unexpected error:', err);
    }
}

listAllUsers();
