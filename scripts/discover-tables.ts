import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function discover() {
    // Try to find any table that might contain stories
    const queries = [
        'success_stories',
        'stories',
        'seller_stories',
        'testimonials',
        'products',
        'profiles',
        'orders'
    ];

    for (const table of queries) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            if (!error.message.includes('not exist')) {
                console.log(`Table "${table}" error: ${error.message}`);
            }
        } else {
            console.log(`Table "${table}": ${count} rows`);
        }
    }

    // Also check if there's any RPC or anything
}

discover();
