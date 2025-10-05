'use server'

import { NextResponse, NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import type { Product } from '@/lib/types'
import { getAuthenticatedUser } from '@/lib/server-auth'

async function authorizeSeller(request: NextRequest, productId: string): Promise<{user: any, product: Product} | NextResponse> {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'seller') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const productDoc = await adminDb.collection('products').doc(productId).get();
        if (!productDoc.exists) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        const product = { id: productDoc.id, ...productDoc.data() } as Product;
        
        // Authorization check: Does the product belong to the authenticated seller?
        if (product.sellerId !== user.id) {
            return NextResponse.json({ message: 'Product not found or access denied' }, { status: 404 });
        }
        
        return { user, product };
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     description: Returns a single product by ID, owned by the seller.
 *     responses:
 *       200:
 *         description: The requested product.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Product not found or access denied.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const authResult = await authorizeSeller(request, id);
    if (authResult instanceof NextResponse) return authResult;

    const { product } = authResult;
    return NextResponse.json(product);
}

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     description: Updates an existing product owned by the seller.
 *     responses:
 *       200:
 *         description: The updated product.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Product not found or access denied.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const authResult = await authorizeSeller(request, id);
    if (authResult instanceof NextResponse) return authResult;

    const { product } = authResult;

    try {
        const body = await request.json();
        const updatedData = {
            ...body,
            updatedAt: new Date(),
        };

        await adminDb.collection('products').doc(id).update(updatedData);
        const updatedProduct = { ...product, ...updatedData };
        
        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     description: Deletes a product by ID owned by the seller.
 *     responses:
 *       200:
 *         description: Deletion successful.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Product not found or access denied.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const authResult = await authorizeSeller(request, id);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await adminDb.collection('products').doc(id).delete();
        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
