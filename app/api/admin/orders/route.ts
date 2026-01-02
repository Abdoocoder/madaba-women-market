import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { Order, Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('orders')
            .select('*, customer:profiles!customer_id(name), order_items(*, product:products(*))');

        if (error) throw error;

        const orders: Order[] = data.map((o: any) => ({
            id: o.id,
            customerId: o.customer_id || '',
            customerName: o.customer?.name || o.customer_name || 'Unknown Customer',
            sellerId: o.seller_id || '',
            sellerName: o.seller_name || 'Unknown Seller',
            total: o.total_price || 0,
            status: o.status || 'pending',
            shippingAddress: o.shipping_address || '',
            customerPhone: o.customer_phone || '',
            paymentMethod: o.payment_method || 'COD',
            createdAt: new Date(o.created_at),
            items: o.order_items?.map((item: any) => ({
                product: {
                    id: item.product?.id || '',
                    name: item.product?.name || 'Unknown Product',
                    nameAr: item.product?.name_ar || '',
                    description: item.product?.description || '',
                    descriptionAr: item.product?.description_ar || '',
                    price: item.product?.price || 0,
                    category: item.product?.category || '',
                    image: item.product?.image_url || '',
                    sellerId: item.product?.seller_id || '',
                    sellerName: item.product?.seller_name || '',
                    stock: item.product?.stock || 0,
                    featured: item.product?.featured || false,
                    approved: item.product?.approved || false,
                    createdAt: item.product?.created_at ? new Date(item.product.created_at) : new Date()
                } as Product,
                quantity: item.quantity || 1
            })) || []
        }));

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { orderId, status } = await request.json();

        if (!orderId || !status) {
            return NextResponse.json({ message: 'Order ID and status are required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', orderId);

        if (error) throw error;

        return NextResponse.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
