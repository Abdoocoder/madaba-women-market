import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function resetAdminPassword() {
    const adminEmail = 'abdoocoder@gmail.com';
    const newPassword = 'AdminPassword123!';

    console.log(`Resetting password for ${adminEmail}...`);

    // Use admin auth api to update user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const adminUser = users.find(u => u.email === adminEmail);
    if (!adminUser) {
        console.error('Admin user not found');
        return;
    }

    const { data, error } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { password: newPassword }
    );

    if (error) {
        console.error('Error resetting password:', error.message);
    } else {
        console.log('Success! Password reset to: AdminPassword123!');
    }
}

resetAdminPassword();
