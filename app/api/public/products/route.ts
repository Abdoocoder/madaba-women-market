'use server'

import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin';
import type { Product } from '@/lib/types';

/**
 * @swagger
 * /api/public/products:
 *   get:
 *     description: Returns the list of approved products for public access
 *     responses:
 *       200:
 *         description: A list of products.
 */
export async function GET() {
    try {
        const adminDb = getAdminDb();
        const productsRef = adminDb.collection('products');
        
        // Only fetch approved products
        const query = productsRef.where('approved', '==', true);
        const snapshot = await query.get();
        
        const products: Product[] = [];
        snapshot.forEach((doc) => {
            const productData = doc.data();
            // Only add products with valid data
            if (productData) {
                products.push({ id: doc.id, ...productData } as Product);
            }
        });
        
        // Filter out any products without valid IDs
        const validProducts = products.filter(product => product.id);
        
        return NextResponse.json(validProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}