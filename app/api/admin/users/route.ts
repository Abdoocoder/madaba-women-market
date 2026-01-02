import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthenticatedUser } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'
import type { User } from '@/lib/types'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) throw error;

        const users: User[] = data.map((p: any) => ({
            id: p.id,
            email: p.email,
            name: p.name,
            photoURL: p.avatar_url,
            role: p.role,
            status: p.status,
            createdAt: new Date(p.created_at)
        }));

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { userId, role } = await request.json();

        if (!userId || !role) {
            return NextResponse.json({ message: 'User ID and role are required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId);

        if (error) throw error;

        return NextResponse.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) throw error;

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
