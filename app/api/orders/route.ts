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
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ 
                message: 'Authentication required',
                hint: 'Please check server logs for configuration issues'
            }, { status: 401 });
        }
        
        const adminDb = getAdminDb();
        const ordersRef = adminDb.collection('orders');
        
        let query;
        if (user.role === 'seller') {
            // Sellers see orders for their products
            query = ordersRef.where('sellerId', '==', user.id);
        } else if (user.role === 'customer') {
            // Customers see their own orders
            query = ordersRef.where('customerId', '==', user.id);
        } else if (user.role === 'admin') {
            // Admins see all orders
            query = ordersRef;
        } else {
            return NextResponse.json({ 
                message: 'Access denied',
                userRole: user.role 
            }, { status: 403 });
        }
        
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
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/orders:
 *   post:
 *     description: Create a new order
 *     responses:
 *       201:
 *         description: Order created successfully.
 *       400:
 *         description: Invalid request data.
 *       401:
 *         description: Unauthorized.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ 
                message: 'Authentication required'
            }, { status: 401 });
        }
        
        if (user.role !== 'customer') {
            return NextResponse.json({ 
                message: 'Only customers can create orders'
            }, { status: 403 });
        }

        const body = await request.json();
        const { items, shippingAddress } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ 
                message: 'Order must contain at least one item'
            }, { status: 400 });
        }

        const adminDb = getAdminDb();
        
        // Group items by seller
        const ordersBySeller: { [sellerId: string]: any } = {};
        
        for (const item of items) {
            const { product, quantity } = item;
            
            if (!product || !product.id || !product.sellerId || quantity <= 0) {
                return NextResponse.json({ 
                    message: 'Invalid item data'
                }, { status: 400 });
            }
            
            if (!ordersBySeller[product.sellerId]) {
                ordersBySeller[product.sellerId] = {
                    sellerId: product.sellerId,
                    items: [],
                    total: 0
                };
            }
            
            ordersBySeller[product.sellerId].items.push(item);
            ordersBySeller[product.sellerId].total += product.price * quantity;
        }

        // Create separate orders for each seller
        const createdOrders = [];
        const ordersRef = adminDb.collection('orders');
        
        for (const sellerOrder of Object.values(ordersBySeller)) {
            const orderData = {
                customerId: user.id,
                customerName: user.name,
                customerEmail: user.email,
                sellerId: sellerOrder.sellerId,
                items: sellerOrder.items,
                total: sellerOrder.total,
                status: 'pending',
                shippingAddress: shippingAddress || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            const docRef = await ordersRef.add(orderData);
            createdOrders.push({ id: docRef.id, ...orderData });
        }

        return NextResponse.json({ 
            message: 'Orders created successfully',
            orders: createdOrders
        }, { status: 201 });
        
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
