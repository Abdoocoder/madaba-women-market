import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function checkRoles() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role');

    if (error) {
        console.error('Error fetching profiles:', error);
    } else {
        console.log('Profiles found:');
        data.forEach(p => console.log(`${p.email || p.id}: ${p.role}`));
    }
}

checkRoles();
