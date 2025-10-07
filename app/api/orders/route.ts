'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { Order, Product,  } from '@/lib/types'

/**
 * @swagger
 * /api/orders:
 *   get:
 *     description: Returns orders for the authenticated user based on their role
 *     responses:
 *       200:
 *         description: A list of orders.
 *       401:
 *         description: Unauthorized.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        {
          message: 'Authentication required',
          hint: 'Please check server logs for configuration issues',
        },
        { status: 401 },
      )
    }

    const adminDb = getAdminDb()
    const ordersRef = adminDb.collection('orders')

    // 🔹 Build Firestore query based on user role
    let query:
      | FirebaseFirestore.Query<FirebaseFirestore.DocumentData>
      | FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>

    switch (user.role) {
      case 'seller':
        query = ordersRef.where('sellerId', '==', user.id)
        break
      case 'customer':
        query = ordersRef.where('customerId', '==', user.id)
        break
      case 'admin':
        query = ordersRef
        break
      default:
        return NextResponse.json(
          { message: 'Access denied', userRole: user.role },
          { status: 403 },
        )
    }

    const snapshot = await query.get()

    const orders: Order[] = snapshot.docs.map(
      (doc) => {
        const data = doc.data() as Order;
        return {
          ...data,
          id: doc.id,
        };
      }
    )

    // Sort orders by most recent
    orders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

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

/**
 * @swagger
 * /api/orders:
 *   post:
 *     description: Create a new order for the authenticated customer
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
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    if (user.role !== 'customer') {
      return NextResponse.json({ message: 'Only customers can create orders' }, { status: 403 })
    }

    const body = await request.json()
    const { items, shippingAddress } = body as {
      items: { product: Product; quantity: number }[]
      shippingAddress?: string
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Order must contain at least one item' }, { status: 400 })
    }

    const adminDb = getAdminDb()
    const ordersRef = adminDb.collection('orders')

    // 🔹 Group items by sellerId
    const ordersBySeller: Record<
      string,
      { sellerId: string; items: { product: Product; quantity: number }[]; total: number }
    > = {}

    for (const item of items) {
      const { product, quantity } = item

      if (!product?.id || !product?.sellerId || quantity <= 0) {
        return NextResponse.json({ message: 'Invalid item data' }, { status: 400 })
      }

      if (!ordersBySeller[product.sellerId]) {
        ordersBySeller[product.sellerId] = {
          sellerId: product.sellerId,
          items: [],
          total: 0,
        }
      }

      ordersBySeller[product.sellerId].items.push(item)
      ordersBySeller[product.sellerId].total += product.price * quantity
    }

    // 🔹 Create separate orders for each seller
    const createdOrders: Order[] = []

    for (const sellerOrder of Object.values(ordersBySeller)) {
      const orderData = {
        customerId: user.id,
        customerEmail: user.email,
        sellerId: sellerOrder.sellerId,
        items: sellerOrder.items,
        total: sellerOrder.total,
        status: 'pending' as const,
        shippingAddress: shippingAddress || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const docRef = await ordersRef.add(orderData)
      createdOrders.push({ id: docRef.id, ...orderData })
    }

    return NextResponse.json(
      { message: 'Orders created successfully', orders: createdOrders },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
