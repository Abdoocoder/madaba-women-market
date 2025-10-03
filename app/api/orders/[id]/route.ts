'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server-auth'

// This state is not shared with other files. A real database is needed for consistency.
let MOCK_ORDERS = [
  {
    id: 'ORD001',
    sellerId: 'user-2',
    customer: 'علياء محمد',
    date: '2023-10-26T10:00:00Z',
    total: 150.0,
    status: 'pending',
    items: [{ productId: 'prod_1', quantity: 1, price: 150.0 }]
  },
  {
    id: 'ORD002',
    sellerId: 'user-2',
    customer: 'فاطمة حسين',
    date: '2023-10-25T14:30:00Z',
    total: 75.5,
    status: 'processing',
    items: [{ productId: 'prod_2', quantity: 1, price: 75.5 }]
  },
  {
    id: 'ORD003',
    sellerId: 'user-1', 
    customer: 'أحمد ناصر',
    date: '2023-10-25T11:00:00Z',
    total: 35.0,
    status: 'shipped',
    items: [{ productId: 'prod_3', quantity: 1, price: 35.0 }]
  },
  {
    id: 'ORD004',
    sellerId: 'user-2',
    customer: 'نورة خالد',
    date: '2023-10-24T09:15:00Z',
    total: 220.0,
    status: 'shipped',
    items: [{ productId: 'prod_4', quantity: 2, price: 110.0 }]
  },
  {
    id: 'ORD005',
    sellerId: 'user-2',
    customer: 'سارة عبد الله',
    date: '2023-10-23T18:00:00Z',
    total: 99.99,
    status: 'pending',
    items: [{ productId: 'prod_5', quantity: 1, price: 99.99 }]
  },
];

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
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'seller') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const orderId = params.id;
        const { status } = await request.json();

        if (!status) {
            return NextResponse.json({ message: 'Status is required' }, { status: 400 });
        }

        const orderIndex = MOCK_ORDERS.findIndex((o) => o.id === orderId);

        if (orderIndex === -1) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Authorization check: Does the order belong to the authenticated seller?
        if (MOCK_ORDERS[orderIndex].sellerId !== user.uid) {
            return NextResponse.json({ message: 'Order not found or access denied' }, { status: 404 });
        }

        MOCK_ORDERS[orderIndex].status = status;

        return NextResponse.json(MOCK_ORDERS[orderIndex]);

    } catch (error) {
        console.error(`Error updating order ${params.id}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
