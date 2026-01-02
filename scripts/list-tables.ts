import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
    // PostgREST doesn't have a direct 'list tables' but we can query the schema
    // via a trick or check common names.
    // Actually, Supabase has a 'rpc' for some things or we can try to query 'information_schema'
    // but RLS usually blocks that for anon key.

    // Let's try to query some common names.
    const commonNames = ['success_stories', 'stories', 'seller_stories', 'testimonials'];
    for (const name of commonNames) {
        const { data, error } = await supabase.from(name).select('count');
        if (!error) {
            console.log(`Table "${name}" exists and has data.`);
        } else if (error.code !== 'PGRST116' && !error.message.includes('not exist')) {
            // Table might exist but count failed for other reason
            console.log(`Table "${name}" might exist (Error: ${error.message})`);
        } else {
            console.log(`Table "${name}" does not exist.`);
        }
    }
}

listTables();
