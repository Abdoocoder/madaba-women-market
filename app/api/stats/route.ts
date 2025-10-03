'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server-auth'

// Mock Data for Orders. In a real app, this would be in a database.
// This should be consistent with the data in /api/orders routes.
const MOCK_ORDERS = [
  { id: 'ORD001', sellerId: 'user-2', customer: 'علياء محمد', date: '2023-10-26T10:00:00Z', total: 150.0, status: 'delivered', items: [] },
  { id: 'ORD002', sellerId: 'user-2', customer: 'فاطمة حسين', date: '2023-10-25T14:30:00Z', total: 75.5, status: 'delivered', items: [] },
  { id: 'ORD003', sellerId: 'user-1', customer: 'أحمد ناصر', date: '2023-09-15T11:00:00Z', total: 35.0, status: 'shipped', items: [] },
  { id: 'ORD004', sellerId: 'user-2', customer: 'نورة خالد', date: '2023-09-24T09:15:00Z', total: 220.0, status: 'shipped', items: [] },
  { id: 'ORD005', sellerId: 'user-2', customer: 'سارة عبد الله', date: '2023-08-23T18:00:00Z', total: 99.99, status: 'delivered', items: [] },
  { id: 'ORD006', sellerId: 'user-2', customer: 'محمد علي', date: '2023-10-02T11:00:00Z', total: 450.0, status: 'delivered', items: [] },
  { id: 'ORD007', sellerId: 'user-2', customer: 'ليلى أحمد', date: '2023-10-05T12:30:00Z', total: 120.0, status: 'cancelled', items: [] },
  { id: 'ORD008', sellerId: 'user-2', customer: 'خالد عبد الرحمن', date: '2023-09-10T15:00:00Z', total: 85.0, status: 'shipped', items: [] },
];

const MONTH_NAMES_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

/**
 * @swagger
 * /api/stats:
 *   get:
 *     description: Returns sales statistics for the authenticated seller.
 *     responses:
 *       200:
 *         description: An object containing monthly and daily sales data.
 *       401:
 *         description: Unauthorized.
 */
export async function GET(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'seller') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const sellerOrders = MOCK_ORDERS.filter(order => 
        order.sellerId === user.uid && (order.status === 'shipped' || order.status === 'delivered')
    );

    // --- Calculate Monthly Sales --- 
    const monthlySales = Array(12).fill(0).map((_, i) => ({ name: MONTH_NAMES_AR[i], total: 0 }));
    sellerOrders.forEach(order => {
        const month = new Date(order.date).getMonth(); // 0-11
        monthlySales[month].total += order.total;
    });
    
    // --- Calculate Daily Sales for the Current Month --- 
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const dailySales = Array(daysInMonth).fill(0).map((_, i) => ({ name: `اليوم ${i + 1}`, total: 0 }));
    sellerOrders.forEach(order => {
        const orderDate = new Date(order.date);
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
            const day = orderDate.getDate(); // 1-31
            dailySales[day - 1].total += order.total;
        }
    });

    const response = {
        monthlySales,
        dailySales,
    };

    return NextResponse.json(response);
}
