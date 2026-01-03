import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function checkDuplicates() {
    const { data, error } = await supabase.from('profiles').select('id, email, role');
    if (error) {
        console.error(error);
        return;
    }

    const emailCounts: Record<string, number> = {};
    data?.forEach(p => {
        if (p.email) {
            const email = p.email.toLowerCase();
            emailCounts[email] = (emailCounts[email] || 0) + 1;
        }
    });

    console.log('--- DUPLICATE EMAILS ---');
    Object.entries(emailCounts).forEach(([email, count]) => {
        if (count > 1) {
            console.log(`${email}: ${count} occurrences`);
            const matches = data?.filter(p => p.email?.toLowerCase() === email);
            matches?.forEach(m => console.log(`  - ID: ${m.id}, Role: ${m.role}`));
        }
    });
}

checkDuplicates();
