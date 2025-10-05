'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { Order } from '@/lib/types'

/**
 * @swagger
 * /api/orders:
 *   get:
 *     description: Returns orders for the authenticated seller
 *     responses:
 *       200:
 *         description: A list of orders.
 *       401:
 *         description: Unauthorized.
 */
export async function GET(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'seller') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const adminDb = getAdminDb();
        const ordersRef = adminDb.collection('orders');
        const query = ordersRef.where('sellerId', '==', user.id);
        const snapshot = await query.get();
        
        const orders: Order[] = [];
        snapshot.forEach((doc: any) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });

        // Sort by most recent date
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
