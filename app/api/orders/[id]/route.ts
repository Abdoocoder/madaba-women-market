import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthenticatedUser } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

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

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Authorization check: Does the order belong to the authenticated seller?
        if (order.seller_id !== user.id) {
            return NextResponse.json({ message: 'Order not found or access denied' }, { status: 404 });
        }

        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json({
            id: updatedOrder.id,
            customerId: updatedOrder.customer_id,
            customerName: updatedOrder.customer_name,
            sellerId: updatedOrder.seller_id,
            sellerName: updatedOrder.seller_name,
            total: updatedOrder.total_price,
            status: updatedOrder.status,
            shippingAddress: updatedOrder.shipping_address,
            customerPhone: updatedOrder.customer_phone,
            paymentMethod: updatedOrder.payment_method,
            createdAt: new Date(updatedOrder.created_at),
            updatedAt: new Date(updatedOrder.updated_at)
        });

    } catch (error) {
        const { id: orderId } = await params;
        console.error(`Error updating order ${orderId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
