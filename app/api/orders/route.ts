import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { Order, Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 },
      )
    }

    let query = supabase.from('orders').select('*, order_items(*, products(*))')

    switch (user.role) {
      case 'seller':
        query = query.eq('seller_id', user.id)
        break
      case 'customer':
        query = query.eq('customer_id', user.id)
        break
      case 'admin':
        // No filter for admin
        break
      default:
        return NextResponse.json(
          { message: 'Access denied', userRole: user.role },
          { status: 403 },
        )
    }

    const { data: ordersData, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    const orders: Order[] = ordersData.map((order: any) => ({
      id: order.id,
      customerId: order.customer_id || '',
      customerName: order.customer_name || 'Unknown Customer',
      sellerId: order.seller_id || '',
      sellerName: order.seller_name || 'Unknown Seller',
      total: order.total_price || 0,
      status: order.status || 'pending',
      shippingAddress: order.shipping_address || '',
      customerPhone: order.customer_phone || '',
      paymentMethod: order.payment_method || 'COD',
      createdAt: new Date(order.created_at),
      items: order.order_items?.map((item: any) => ({
        product: {
          id: item.products?.id || '',
          name: item.products?.name || 'Unknown Product',
          nameAr: item.products?.name_ar || '',
          description: item.products?.description || '',
          descriptionAr: item.products?.description_ar || '',
          price: item.products?.price || 0,
          category: item.products?.category || '',
          image: item.products?.image_url || '',
          sellerId: item.products?.seller_id || '',
          sellerName: item.products?.seller_name || '',
          stock: item.products?.stock || 0,
          featured: item.products?.featured || false,
          approved: item.products?.approved || false,
          createdAt: item.products?.created_at ? new Date(item.products.created_at) : new Date()
        } as Product,
        quantity: item.quantity || 1
      })) || []
    }))

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    if (user.role !== 'customer') {
      return NextResponse.json({ message: 'Only customers can create orders' }, { status: 403 })
    }

    const body = await request.json();
    const {
      customerName,
      shippingAddress,
      customerPhone,
      items, // Array of { product: { id }, quantity }
      totalPrice,
      storeId,
      paymentMethod,
    } = body;

    if (!customerName || !shippingAddress || !customerPhone || !items || !totalPrice || !storeId || !paymentMethod) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Get seller info from profiles table
    const { data: sellerProfile, error: sellerError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', storeId)
      .single();

    if (sellerError || !sellerProfile) {
      return NextResponse.json({ message: 'Seller not found' }, { status: 404 });
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        customer_name: customerName,
        seller_id: storeId,
        seller_name: sellerProfile.name,
        total_price: totalPrice,
        status: 'pending',
        shipping_address: shippingAddress,
        customer_phone: customerPhone,
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return NextResponse.json(
      { message: 'Order created successfully', orderId: order.id },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
