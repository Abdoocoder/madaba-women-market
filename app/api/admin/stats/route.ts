'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { getAuthenticatedUser } from '@/lib/server-auth'

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     description: Returns statistics for admin dashboard
 *     responses:
 *       200:
 *         description: Statistics data.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 */
export async function GET(request: NextRequest) {
    try {
        console.log('=== GET /api/admin/stats ===');
        const user = await getAuthenticatedUser(request);
        console.log('User from auth:', user);
        
        if (!user) {
            console.log('❌ Authentication failed - no user found');
            return NextResponse.json({ 
                message: 'Authentication required'
            }, { status: 401 });
        }
        
        if (user.role !== 'admin') {
            console.log('❌ Access denied - user is not an admin');
            return NextResponse.json({ 
                message: 'Access denied - admin role required',
                userRole: user.role 
            }, { status: 403 });
        }

        const adminDb = getAdminDb();
        
        // Get users count
        const usersSnapshot = await adminDb.collection('users').get();
        const usersCount = usersSnapshot.size;
        
        // Get sellers count
        let sellersCount = 0;
        usersSnapshot.forEach((doc: any) => {
            const userData = doc.data();
            if (userData.role === 'seller') {
                sellersCount++;
            }
        });
        
        // Get products count
        const productsSnapshot = await adminDb.collection('products').get();
        const productsCount = productsSnapshot.size;
        
        // Get orders count
        const ordersSnapshot = await adminDb.collection('orders').get();
        const ordersCount = ordersSnapshot.size;
        
        const stats = {
            users: usersCount,
            sellers: sellersCount,
            products: productsCount,
            orders: ordersCount,
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
