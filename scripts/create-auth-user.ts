import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function createAuthUser() {
    const email = 'abdoocoder@gmail.com';
    const password = 'AdminPassword123!';
    const id = 'e659eb07-e435-46ab-9aae-bdce2cc86dc7';

    console.log(`Creating auth user for ${email} with ID ${id}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        id: id,
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: 'Admin User' }
    });

    if (error) {
        console.error('Error creating auth user:', error.message);
    } else {
        console.log('Success! Auth user created.');
    }
}

createAuthUser();
