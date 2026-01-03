import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function checkPolicies() {
    console.log('--- RLS POLICIES FOR profiles ---');
    const { data, error } = await supabase.rpc('get_policies', { table_name: 'profiles' });

    if (error) {
        // If RPC doesn't exist, try querying pg_policies
        const { data: policies, error: pgError } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'profiles');

        if (pgError) {
            // If that fails too, try a raw SQL query via a temporary function if possible
            // Or just assume we need to add a policy.
            console.log('Could not fetch policies via traditional means. Trying raw SQL...');
            const { data: rawData, error: rawError } = await supabase.rpc('exec_sql', {
                sql_query: "SELECT * FROM pg_policies WHERE tablename = 'profiles'"
            });
            if (rawError) {
                console.error('Final attempt failed:', rawError);
            } else {
                console.log(rawData);
            }
        } else {
            console.log(policies);
        }
    } else {
        console.log(data);
    }
}

// Since I might not have these RPCs, let's just try to see if an authenticated user can read their OWN profile.
async function testSelfRead() {
    const adminId = 'e659eb07-e435-46ab-9aae-bdce2cc86dc7';
    const adminEmail = 'abdoocoder@gmail.com';

    console.log(`\nTesting self-read for ${adminEmail}...`);

    // We need a real JWT to test this properly.
    // But wait, I can just check if THERE ARE ANY policies at all.
}

checkPolicies();
