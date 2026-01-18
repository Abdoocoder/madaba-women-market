import { headers } from "next/headers";
import { supabase, supabaseAdmin } from "./supabase";
import { User } from "./types";
import { NextRequest } from "next/server";

// Unified function to verify Supabase token and get user data
async function verifyTokenAndGetUser(accessToken: string): Promise<User | null> {
    try {
        console.log('🔐 Verifying token, length:', accessToken?.length || 0);

        // Use supabaseAdmin to verify JWT if available, otherwise skip server auth
        if (!supabaseAdmin) {
            return null;
        }

        // Get user from JWT token using admin client
        const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(accessToken);

        if (error || !supabaseUser) {
            return null;
        }

        // Get user data from profiles table using admin client (bypasses RLS)
        // First try by ID
        let { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .maybeSingle();

        // If not found by ID, try by email (to handle legacy profiles or Auth ID changes)
        if (!profile) {
            const { data: emailProfile, error: emailError } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('email', supabaseUser.email)
                .maybeSingle();

            if (emailProfile) {
                // Update existing profile with new Auth ID
                const { data: updatedProfile, error: updateError } = await supabaseAdmin
                    .from('profiles')
                    .update({ id: supabaseUser.id })
                    .eq('email', supabaseUser.email)
                    .select()
                    .maybeSingle();

                if (!updateError && updatedProfile) {
                    profile = updatedProfile;

                    // NEW: Migrate all references to the old ID to the new ID
                    const oldId = emailProfile.id;
                    const newId = supabaseUser.id;

                    console.log(`🔄 Migrating data from old ID ${oldId} to new ID ${newId}`);

                    // Update products
                    await supabaseAdmin.from('products').update({ seller_id: newId }).eq('seller_id', oldId);

                    // Update orders (both as seller and customer)
                    await supabaseAdmin.from('orders').update({ seller_id: newId }).eq('seller_id', oldId);
                    await supabaseAdmin.from('orders').update({ customer_id: newId }).eq('customer_id', oldId);

                    // Update reviews
                    await supabaseAdmin.from('reviews').update({ user_id: newId }).eq('user_id', oldId);

                    // Update carts
                    await supabaseAdmin.from('carts').update({ user_id: newId }).eq('user_id', oldId);

                    console.log('✅ Data migration complete');
                }
            }
        }

        if (!profile) {
            // Auto-create profile if missing (e.g., Google OAuth users)
            const newProfile = {
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: supabaseUser.user_metadata?.full_name || 'User',
                role: 'customer',
                status: 'approved',
                avatar_url: supabaseUser.user_metadata?.avatar_url || '',
            };

            const { data: createdProfile, error: createError } = await supabaseAdmin
                .from('profiles')
                .insert(newProfile)
                .select()
                .maybeSingle();

            if (createError) {
                console.error('Error auto-creating profile:', createError.message);
                // Fallback to returning a transient user object if creation fails
                return {
                    id: supabaseUser.id,
                    email: supabaseUser.email || '',
                    name: supabaseUser.user_metadata?.full_name || 'Unknown User',
                    role: 'customer',
                    status: 'approved',
                    createdAt: new Date(supabaseUser.created_at),
                } as User;
            }

            profile = createdProfile;
        }

        return {
            id: profile.id,
            email: profile.email || '',
            name: profile.name || 'Unknown User',
            photoURL: profile.avatar_url || '',
            role: profile.role || 'customer',
            status: profile.status || 'approved',
            createdAt: new Date(profile.created_at),
        } as User;
    } catch (error) {
        console.log('Error in verifyTokenAndGetUser:', error);
        return null;
    }
}

// Get user from token (for Server Components)
export async function getServerUser(): Promise<User | null> {
    try {
        const headersList = await headers();
        const authHeader = headersList.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const idToken = authHeader.split('Bearer ')[1];
        return await verifyTokenAndGetUser(idToken);
    } catch (error) {
        console.error('Error in getServerUser:', error);
        return null;
    }
}

// Get user from token (for API routes)
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const idToken = authHeader.split('Bearer ')[1];
        return await verifyTokenAndGetUser(idToken);
    } catch (error) {
        console.error('Error in getAuthenticatedUser:', error);
        return null;
    }
}
