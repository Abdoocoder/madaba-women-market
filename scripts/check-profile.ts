
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfile() {
    const email = 'rana@madaba.com';
    console.log(`🔍 Checking profile for ${email}...`);

    const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .ilike('email', email);

    if (error) {
        console.error('❌ Error fetching profiles:', error.message);
        return;
    }

    if (profiles && profiles.length > 0) {
        console.log(`✅ Found ${profiles.length} profile(s):`);
        profiles.forEach(p => {
            console.log(`  - ID: ${p.id}, Email: ${p.email}, Role: ${p.role}`);
        });

        const profile = profiles[0];
        // Check if there are any products for this profile
        const { data: products, error: productsError } = await supabaseAdmin
            .from('products')
            .select('id, seller_id')
            .eq('seller_id', profile.id);

        if (productsError) {
            console.error('❌ Error fetching products:', productsError.message);
        } else {
            console.log(`📦 Found ${products?.length || 0} products for this profile ID.`);
        }
    } else {
        console.log('❌ No profile found with that email.');
    }
}

checkProfile();
