import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthenticatedUser } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        console.log('=== GET /api/admin/stats ===');
        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json({
                message: 'Authentication required'
            }, { status: 401 });
        }

        if (user.role !== 'admin') {
            return NextResponse.json({
                message: 'Access denied - admin role required',
                userRole: user.role
            }, { status: 403 });
        }

        // Get users count
        const { count: usersCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        // Get sellers count
        const { count: sellersCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'seller')

        // Get products count
        const { count: productsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })

        // Get orders count
        const { count: ordersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })

        const stats = {
            users: usersCount || 0,
            sellers: sellersCount || 0,
            products: productsCount || 0,
            orders: ordersCount || 0,
        };

        console.log('✅ Stats fetched successfully:', stats);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        return NextResponse.json({
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
