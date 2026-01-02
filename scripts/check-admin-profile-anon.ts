import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function checkAdminProfile() {
    const adminId = 'e659eb07-e435-46ab-9aae-bdce2cc86dc7';
    console.log(`Checking profile for admin ID: ${adminId} using ANON KEY...`);

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminId)
        .single();

    if (error) {
        console.error('Error fetching admin profile with anon key:', error.message);
    } else {
        console.log('Success! Admin profile fetched:', data);
    }
}

checkAdminProfile();
