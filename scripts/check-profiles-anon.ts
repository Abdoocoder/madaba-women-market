import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function checkProfiles() {
    console.log('Checking profiles with ANON KEY (limit 5)...');

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error fetching profiles with anon key:', error.message);
    } else {
        console.log(`Success! Fetched ${data?.length || 0} profiles.`);
        data?.forEach(p => console.log(`- ID: ${p.id}, Role: ${p.role}`));
    }
}

checkProfiles();
