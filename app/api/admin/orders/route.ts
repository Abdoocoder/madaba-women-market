'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { Order } from '@/lib/types'

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     description: Returns all orders for admin management
 *     responses:
 *       200:
 *         description: A list of all orders.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 */
export async function GET(request: NextRequest) {
    try {
        console.log('=== GET /api/admin/orders ===');
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
        const ordersRef = adminDb.collection('orders');
        const snapshot = await ordersRef.get();
        
        // Fetch all customer data in parallel for better performance
        const customerPromises: Promise<any>[] = [];
        const orderData: any[] = [];
        
        snapshot.forEach((doc: any) => {
            const order = { id: doc.id, ...doc.data() } as Order;
            orderData.push(order);
            // Push promise to fetch customer data
            customerPromises.push(adminDb.collection('users').doc(order.customerId).get());
        });
        
        // Resolve all customer promises
        const customerDocs = await Promise.all(customerPromises);
        
        // Combine order data with customer names
        const orders: any[] = orderData.map((order, index) => {
            const customerDoc = customerDocs[index];
            const customerData = customerDoc.exists ? customerDoc.data() : null;
            return {
                ...order,
                customerName: customerData?.name || order.customerId
            };
        });
        
        console.log(`✅ Found ${orders.length} orders for admin`);

        return NextResponse.json(orders);
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/admin/orders:
 *   put:
 *     description: Updates an order status
 *     responses:
 *       200:
 *         description: Order status updated successfully.
 *       400:
 *         description: Bad request (missing data).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 *       404:
 *         description: Order not found.
 */
export async function PUT(request: NextRequest) {
    try {
        console.log('=== PUT /api/admin/orders ===');
        const user = await getAuthenticatedUser(request);
        
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        if (user.role !== 'admin') {
            return NextResponse.json({ 
                message: 'Access denied - admin role required',
                userRole: user.role 
            }, { status: 403 });
        }

        const { orderId, status } = await request.json();

        if (!orderId || !status) {
            return NextResponse.json({ message: 'Order ID and status are required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        await orderRef.update({ status });
        console.log('✅ Order status updated successfully:', orderId);

        return NextResponse.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
