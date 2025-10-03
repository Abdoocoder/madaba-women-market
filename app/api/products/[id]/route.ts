'use server'

import { NextResponse, NextRequest } from 'next/server'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import type { Product } from '@/lib/types'
import { getAuthenticatedUser } from '@/lib/server-auth'

let products: Product[] = MOCK_PRODUCTS;

async function authorizeSeller(request: NextRequest, productId: string): Promise<{user: any, productIndex: number} | NextResponse> {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'seller') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Authorization check: Does the product belong to the authenticated seller?
    if (products[productIndex].sellerId !== user.uid) {
        // Return 404 to avoid leaking information about which products exist.
        return NextResponse.json({ message: 'Product not found or access denied' }, { status: 404 });
    }
    
    return { user, productIndex };
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
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await authorizeSeller(request, params.id);
    if (authResult instanceof NextResponse) return authResult;

    const { productIndex } = authResult;
    return NextResponse.json(products[productIndex]);
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
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await authorizeSeller(request, params.id);
    if (authResult instanceof NextResponse) return authResult;

    const { productIndex } = authResult;

    try {
        const body = await request.json();
        const originalProduct = products[productIndex];
        const updatedProduct = {
            ...originalProduct,
            ...body,
            updatedAt: new Date(),
        };

        products[productIndex] = updatedProduct;
        return NextResponse.json(updatedProduct);

    } catch (error) {
        console.error(`Error updating product ${params.id}:`, error);
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
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await authorizeSeller(request, params.id);
    if (authResult instanceof NextResponse) return authResult;

    const { productIndex } = authResult;

    products.splice(productIndex, 1);
    return NextResponse.json({ message: 'Product deleted successfully' });
}
