import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function run() {
    const { count, error } = await supabase
        .from('success_stories')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.log('ERROR:' + error.message);
    } else {
        console.log('COUNT:' + count);
    }
}

run();
