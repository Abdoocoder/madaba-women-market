'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import type { Product } from '@/lib/types'

/**
 * @swagger
 * /api/public/products/{id}:
 *   get:
 *     description: Returns a single product by ID for public access
 *     responses:
 *       200:
 *         description: The requested product.
 *       404:
 *         description: Product not found.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const productDoc = await adminDb.collection('products').doc(id).get();
        
        if (!productDoc.exists) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        const productData = productDoc.data();
        const product: Product = { id: productDoc.id, ...productData } as Product;
        
        // Only return approved products
        if (!product.approved) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}