import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function checkTriggers() {
    console.log('--- CHECKING FOR TRIGGERS ---');

    // Checking pg_trigger for anything related to profiles or auth
    const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
      SELECT 
        tgname AS trigger_name,
        relname AS table_name,
        proname AS function_name
      FROM pg_trigger
      JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
      JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
      WHERE relname = 'profiles' OR relname = 'users';
    `
    });

    if (error) {
        console.error('Error fetching triggers:', error.message);
        // If RPC fails, try a different query or just assume we might need one.
    } else {
        console.log('Triggers found:', data);
    }
}

checkTriggers();
