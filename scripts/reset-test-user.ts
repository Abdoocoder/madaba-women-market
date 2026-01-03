import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function resetTestUser() {
    const email = 'en.abdooraf3@gmail.com';
    const password = 'TestPassword123!';
    const id = '4c9c21d8-3c27-4673-a742-290dad605e58';

    console.log(`Resetting password for ${email}...`);

    const { data, error } = await supabase.auth.admin.updateUserById(
        id,
        { password: password }
    );

    if (error) {
        console.error('Error resetting password:', error.message);
    } else {
        console.log('Success! Password reset to: TestPassword123!');
    }
}

resetTestUser();
