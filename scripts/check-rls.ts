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

    // Check products
    const { data: serviceProducts, error: prodServiceError } = await supabase.from('products').select('*');
    console.log(`Products (Service Role): ${serviceProducts?.length || 0}`);
    if (prodServiceError) console.error('Products Service Role Error:', prodServiceError);

    const supabaseAnon = createClient(supabaseUrl!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: anonProducts, error: anonProdError } = await supabaseAnon.from('products').select('*');
    console.log(`Products (Anon Key): ${anonProducts?.length || 0}`);
    if (anonProdError) console.error('Products Anon Key Error:', anonProdError);
}

checkRLS();
