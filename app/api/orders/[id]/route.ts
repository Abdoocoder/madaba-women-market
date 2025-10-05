'use server'

import { NextResponse, NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { Order } from '@/lib/types'

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     description: Updates the status of an order for the authenticated seller.
 *     responses:
 *       200:
 *         description: The updated order.
 *       400:
 *         description: Bad request (e.g., missing status).
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Order not found or access denied.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'seller') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id: orderId } = await params;
        const { status } = await request.json();

        if (!status) {
            return NextResponse.json({ message: 'Status is required' }, { status: 400 });
        }

        const orderDoc = await adminDb.collection('orders').doc(orderId).get();
        if (!orderDoc.exists) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        const order = { id: orderDoc.id, ...orderDoc.data() } as Order;
        
        // Authorization check: Does the order belong to the authenticated seller?
        if (order.sellerId !== user.id) {
            return NextResponse.json({ message: 'Order not found or access denied' }, { status: 404 });
        }

        await adminDb.collection('orders').doc(orderId).update({
            status,
            updatedAt: new Date()
        });

        const updatedOrder = { ...order, status, updatedAt: new Date() };
        return NextResponse.json(updatedOrder);

    } catch (error) {
        const { id: orderId } = await params;
        console.error(`Error updating order ${orderId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
