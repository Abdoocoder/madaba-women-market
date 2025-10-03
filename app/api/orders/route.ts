'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server-auth'

// Mock Data for Orders. In a real app, this would be in a database.
const MOCK_ORDERS = [
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
    sellerId: 'user-1', // Belongs to a different seller
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
]

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

    const sellerOrders = MOCK_ORDERS.filter(order => order.sellerId === user.uid);

    // Sort by most recent date
    sellerOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(sellerOrders);
}
