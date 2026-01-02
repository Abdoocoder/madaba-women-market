import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStories() {
    console.log('Checking success_stories table...');
    const { data, error } = await supabase
        .from('success_stories')
        .select('*');

    if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "success_stories" does not exist')) {
            console.error('ERROR: Table "success_stories" does not exist.');
        } else {
            console.error('ERROR fetching stories:', error);
        }
    } else {
        console.log(`SUCCESS: Found ${data.length} stories in the database.`);
        if (data.length > 0) {
            console.log('First story sample:', data[0]);
        }
    }
}

checkStories();
