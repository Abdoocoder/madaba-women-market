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

async function verifyConnection() {
    console.log('🔍 Verifying Supabase connection...\n');
    console.log(`📧 Account Email: eng.abdooraf3@gmail.com`);
    console.log(`🌐 Project URL: ${supabaseUrl}\n`);

    try {
        // Test 1: Check Auth Service
        console.log('1️⃣ Testing Auth Service...');
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
            console.error('   ❌ Auth Error:', authError.message);
        } else {
            console.log(`   ✅ Auth working! Found ${users.length} user(s)`);
        }

        // Test 2: Check Database
        console.log('\n2️⃣ Testing Database...');
        const { data: profiles, error: dbError } = await supabase
            .from('profiles')
            .select('id, email, role')
            .limit(5);

        if (dbError) {
            console.error('   ❌ Database Error:', dbError.message);
        } else {
            console.log(`   ✅ Database working! Found ${profiles?.length || 0} profile(s)`);
        }

        // Test 3: Check Products
        console.log('\n3️⃣ Testing Products Table...');
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('id, name')
            .limit(3);

        if (prodError) {
            console.error('   ❌ Products Error:', prodError.message);
        } else {
            console.log(`   ✅ Products working! Found ${products?.length || 0} product(s)`);
        }

        console.log('\n✅ Connection verified successfully!');
        console.log('\n📝 Project Info:');
        console.log(`   Account: eng.abdooraf3@gmail.com`);
        console.log(`   Project: ibsnucymmticrnfqbfro`);
        console.log(`   Dashboard: https://supabase.com/dashboard/project/ibsnucymmticrnfqbfro`);

    } catch (err) {
        console.error('💥 Unexpected error:', err);
    }
}

verifyConnection();
