import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { User } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'seller');

        if (error) throw error;

        const sellers: User[] = data.map((p: any) => ({
            id: p.id,
            email: p.email,
            name: p.name,
            photoURL: p.avatar_url,
            role: p.role,
            status: p.status,
            createdAt: new Date(p.created_at),
            storeName: p.store_name,
            storeDescription: p.store_description,
            storeCategory: p.store_category
        }));

        return NextResponse.json(sellers);
    } catch (error) {
        console.error('Error fetching sellers:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { sellerId, status } = await request.json();

        if (!sellerId || !status) {
            return NextResponse.json({ message: 'Seller ID and status are required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('profiles')
            .update({ status })
            .eq('id', sellerId)
            .eq('role', 'seller');

        if (error) throw error;

        return NextResponse.json({ message: 'Seller status updated successfully' });
    } catch (error) {
        console.error('Error updating seller status:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
