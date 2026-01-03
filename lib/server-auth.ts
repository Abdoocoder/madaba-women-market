import { headers } from "next/headers";
import { supabase, supabaseAdmin } from "./supabase";
import { User } from "./types";
import { NextRequest } from "next/server";

// Unified function to verify Supabase token and get user data
async function verifyTokenAndGetUser(idToken: string): Promise<User | null> {
    try {
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(idToken);

        if (error || !supabaseUser) {
            console.error('Error verifying Supabase token:', error);
            return null;
        }

        // Get user data from profiles table
        // Use supabaseAdmin if available to bypass RLS for role checks
        const client = supabaseAdmin || supabase;
        const { data: profile, error: profileError } = await client
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

        if (profileError || !profile) {
            // Auto-create profile if missing (e.g., Google OAuth users)
            const newProfile = {
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: supabaseUser.user_metadata?.full_name || 'User',
                role: 'customer',
                status: 'approved',
                avatar_url: supabaseUser.user_metadata?.avatar_url || '',
            };

            const { data: createdProfile, error: createError } = await client
                .from('profiles')
                .insert(newProfile)
                .select()
                .single();

            if (createError) {
                console.error('Error auto-creating profile:', createError);
                // Fallback to returning a transient user object if creation fails
                return {
                    id: supabaseUser.id,
                    email: supabaseUser.email || '',
                    name: supabaseUser.user_metadata?.full_name || 'Unknown User',
                    role: 'customer',
                    createdAt: new Date(supabaseUser.created_at),
                } as User;
            }

            return {
                id: createdProfile.id,
                email: createdProfile.email || '',
                name: createdProfile.name || 'Unknown User',
                photoURL: createdProfile.avatar_url || '',
                role: createdProfile.role || 'customer',
                status: createdProfile.status || 'approved',
                createdAt: new Date(createdProfile.created_at),
            } as User;
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
        console.error('Error in verifyTokenAndGetUser:', error);
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
