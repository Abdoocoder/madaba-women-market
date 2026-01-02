import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function search() {
    const email = 'en.abdooraf3@gmail.com';
    const { data, error } = await supabase.from('profiles').select('*').ilike('email', email).single();
    if (error) {
        if (error.code === 'PGRST116') {
            console.log(`Profile for ${email} NOT found.`);
        } else {
            console.error(error);
        }
    } else {
        console.log(`Profile for ${email} found:`, data);
    }
}

search();
