import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function compare() {
    const { data: profiles } = await supabase.from('profiles').select('id, email, role');
    const { data: { users } } = await supabase.auth.admin.listUsers();

    console.log('--- PROFILES ---');
    profiles?.forEach(p => console.log(`ID: ${p.id}, Email: ${p.email}, Role: ${p.role}`));

    console.log('--- AUTH USERS ---');
    users.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}`));
}

compare();
