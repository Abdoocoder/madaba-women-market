import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function checkRLS() {
    console.log('--- RLS POLICIES ---');
    // We can query pg_policies via a raw SQL query if we have an RPC or if we can use the service role to query information_schema
    // But usually we can just try to see if we can read everything with anon key vs service role.

    // Let's try to query public.success_stories with the service role (bypasses RLS)
    const { data: serviceStories, error: serviceError } = await supabase.from('success_stories').select('*');
    console.log(`Stories (Service Role): ${serviceStories?.length || 0}`);
    if (serviceError) console.error('Service Role Error:', serviceError);

    // Now let's try with the anon key (if we can recreate it here)
    const supabaseAnon = createClient(supabaseUrl!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: anonStories, error: anonError } = await supabaseAnon.from('success_stories').select('*');
    console.log(`Stories (Anon Key): ${anonStories?.length || 0}`);
    if (anonError) console.error('Anon Key Error:', anonError);
}

checkRLS();
