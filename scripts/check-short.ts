
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

async function check() {
    const { data: profile } = await supabaseAdmin.from('profiles').select('id, email, role').ilike('email', 'rana@madaba.com').maybeSingle();
    if (profile) {
        console.log('PROFILE_ID:' + profile.id);
        console.log('PROFILE_EMAIL:' + profile.email);
        console.log('PROFILE_ROLE:' + profile.role);
    } else {
        console.log('PROFILE_NOT_FOUND');
    }
}
check();
