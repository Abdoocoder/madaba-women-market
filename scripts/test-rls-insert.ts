import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function testInsert() {
    const testId = '00000000-0000-0000-0000-000000000001';
    console.log(`Testing insert into profiles with anon key for ID: ${testId}`);

    const { error } = await supabase
        .from('profiles')
        .insert({
            id: testId,
            email: 'test@example.com',
            name: 'Test User',
            role: 'customer'
        });

    if (error) {
        console.log('Insert failed:', error.message);
        console.log('Error details:', error);
    } else {
        console.log('Insert successful!');

        // Cleanup
        const serviceClient = createClient(supabaseUrl!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
        await serviceClient.from('profiles').delete().eq('id', testId);
        console.log('Test record cleaned up.');
    }
}

testInsert();
