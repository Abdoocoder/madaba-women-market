'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { Order } from '@/lib/types'

/**
 * @swagger
 * /api/stats:
 *   get:
 *     description: Returns sales statistics for the authenticated seller
 *     responses:
 *       200:
 *         description: Sales statistics.
 *       401:
 *         description: Unauthorized.
 */
export async function GET(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'seller') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get orders for this seller
        const adminDb = getAdminDb();
        const ordersRef = adminDb.collection('orders');
        const query = ordersRef.where('sellerId', '==', user.id);
        const snapshot = await query.get();
        
        const orders: Order[] = [];
        snapshot.forEach((doc: any) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });

        // Calculate statistics
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const deliveredOrders = orders.filter(order => order.status === 'delivered');
        const currentMonthOrders = deliveredOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });
        
        const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
        const monthlyRevenue = currentMonthOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = deliveredOrders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        
        // Generate monthly data for the chart (last 6 months)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.getMonth();
            const year = date.getFullYear();
            
            const monthOrders = deliveredOrders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.getMonth() === month && orderDate.getFullYear() === year;
            });
            
            const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
            
            monthlyData.push({
                month: date.toLocaleDateString('ar', { month: 'short' }),
                revenue: monthRevenue
            });
        }

        return NextResponse.json({
            totalRevenue,
            monthlyRevenue,
            totalOrders,
            pendingOrders,
            monthlyData
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
