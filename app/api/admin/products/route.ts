'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { Product } from '@/lib/types'

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     description: Returns all products for admin management
 *     responses:
 *       200:
 *         description: A list of all products.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 */
export async function GET(request: NextRequest) {
    try {
        console.log('=== GET /api/admin/products ===');
        const user = await getAuthenticatedUser(request);
        console.log('User from auth:', user);
        
        if (!user) {
            console.log('❌ Authentication failed - no user found');
            return NextResponse.json({ 
                message: 'Authentication required'
            }, { status: 401 });
        }
        
        if (user.role !== 'admin') {
            console.log('❌ Access denied - user is not an admin');
            return NextResponse.json({ 
                message: 'Access denied - admin role required',
                userRole: user.role 
            }, { status: 403 });
        }

        const adminDb = getAdminDb();
        const productsRef = adminDb.collection('products');
        const snapshot = await productsRef.get();
        
        const products: Product[] = [];
        snapshot.forEach((doc) => {
            // Only add products with valid IDs
            if (doc.id && doc.id.trim() !== '') {
                products.push({ id: doc.id, ...doc.data() } as Product);
            }
        });
        
        console.log(`✅ Found ${products.length} products for admin`);

        return NextResponse.json(products);
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     description: Updates a product (approve, reject, feature, etc.)
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *       400:
 *         description: Bad request (missing data).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 *       404:
 *         description: Product not found.
 */
export async function POST(request: NextRequest) {
    try {
        console.log('=== POST /api/admin/products ===');
        const user = await getAuthenticatedUser(request);
        
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        if (user.role !== 'admin') {
            return NextResponse.json({ 
                message: 'Access denied - admin role required',
                userRole: user.role 
            }, { status: 403 });
        }

        const { productId, action, value } = await request.json();

        if (!productId) {
            return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const productRef = adminDb.collection('products').doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        // Handle different actions
        switch (action) {
            case 'approve':
                await productRef.update({ approved: true });
                break;
            case 'reject':
                await productRef.update({ approved: false });
                break;
            case 'suspend':
                await productRef.update({ suspended: value });
                break;
            case 'feature':
                await productRef.update({ featured: value });
                break;
            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

        console.log(`✅ Product ${action}d successfully:`, productId);

        return NextResponse.json({ message: `Product ${action}d successfully` });
    } catch (error) {
        console.error('❌ Error updating product:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/admin/products:
 *   delete:
 *     description: Deletes a product by ID
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *       400:
 *         description: Bad request (missing ID).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 *       404:
 *         description: Product not found.
 */
export async function DELETE(request: NextRequest) {
    try {
        console.log('=== DELETE /api/admin/products ===');
        const user = await getAuthenticatedUser(request);
        
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        if (user.role !== 'admin') {
            return NextResponse.json({ 
                message: 'Access denied - admin role required',
                userRole: user.role 
            }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id');

        if (!productId) {
            return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const productRef = adminDb.collection('products').doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        await productRef.delete();
        console.log('✅ Product deleted successfully:', productId);

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
