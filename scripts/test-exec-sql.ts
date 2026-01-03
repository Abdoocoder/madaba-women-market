import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function testExecSql() {
    console.log('Testing for exec_sql RPC...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: "SELECT 1" });

    if (error) {
        console.log('exec_sql RPC not found or failed:', error.message);
    } else {
        console.log('exec_sql RPC found! Result:', data);
    }
}

testExecSql();
