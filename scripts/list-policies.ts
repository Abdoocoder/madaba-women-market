
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

async function listPolicies() {
    console.log('📋 Fetching all RLS policies from pg_policies...');

    const { data, error } = await supabaseAdmin.rpc('get_all_policies');

    if (error) {
        // If the RPC doesn't exist, try a direct query (using admin client)
        console.log('⚠️ get_all_policies RPC failed, trying direct select from pg_policies...');
        const { data: policies, error: queryError } = await supabaseAdmin
            .from('pg_policies')
            .select('*')
            .eq('schemaname', 'public');

        if (queryError) {
            console.error('❌ Error fetching from pg_policies:', queryError.message);

            // Try another way: using a custom SQL query if possible
            console.log('🔄 Trying to list tablenames and policies via generic query...');
            const { data: tables, error: tablesError } = await supabaseAdmin
                .from('pg_tables')
                .select('tablename')
                .eq('schemaname', 'public');

            if (tablesError) {
                console.error('❌ Error fetching tables:', tablesError.message);
            } else {
                console.log('Tables found:', tables.map(t => t.tablename).join(', '));
            }
        } else {
            console.log('✅ Policies found:', JSON.stringify(policies, null, 2));
        }
    } else {
        console.log('✅ Policies found via RPC:', JSON.stringify(data, null, 2));
    }
}

listPolicies();
