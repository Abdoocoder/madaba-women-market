'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import type { Product } from '@/lib/types'
import { getAuthenticatedUser } from '@/lib/server-auth'

/**
 * @swagger
 * /api/products:
 *   get:
 *     description: Returns the list of products for the authenticated seller
 *     responses:
 *       200:
 *         description: A list of products.
 *       401:
 *         description: Unauthorized.
 */
export async function GET(request: NextRequest) {
    try {
        console.log('=== GET /api/products ===');
        const user = await getAuthenticatedUser(request);
        console.log('User from auth:', user);
        
        if (!user) {
            console.log('❌ Authentication failed - no user found');
            return NextResponse.json({ 
                message: 'Authentication required',
                hint: 'Please check server logs for configuration issues'
            }, { status: 401 });
        }
        
        if (user.role !== 'seller') {
            console.log('❌ Access denied - user is not a seller');
            return NextResponse.json({ 
                message: 'Access denied - seller role required',
                userRole: user.role 
            }, { status: 401 });
        }

        const adminDb = getAdminDb();
        const productsRef = adminDb.collection('products');
        const query = productsRef.where('sellerId', '==', user.id);
        const snapshot = await query.get();
        
        const products: Product[] = [];
        snapshot.forEach((doc: any) => {
            const productData = doc.data();
            // Only add products with valid data
            if (productData) {
                products.push({ id: doc.id, ...productData } as Product);
            }
        });
        
        // Filter out any products without valid IDs (shouldn't happen, but just in case)
        const validProducts = products.filter(product => product.id);
        
        console.log(`✅ Found ${validProducts.length} products for seller ${user.id}`);

        return NextResponse.json(validProducts);
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
 * /api/products:
 *   post:
 *     description: Creates a new product for the authenticated seller
 *     responses:
 *       201:
 *         description: The created product.
 *       400:
 *         description: Bad request (e.g., missing data).
 *       401:
 *         description: Unauthorized.
 */
export async function POST(request: NextRequest) {
    console.log('=== POST /api/products ===');
    const user = await getAuthenticatedUser(request);
    console.log('User from auth:', user);
    
    if (!user || user.role !== 'seller') {
        console.log('❌ Authentication failed for POST request');
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const nameAr = formData.get('nameAr') as string;
        const descriptionAr = formData.get('descriptionAr') as string;
        const price = Number(formData.get('price'));
        const category = formData.get('category') as string;
        const stock = Number(formData.get('stock'));
        const imageUrl = formData.get('imageUrl') as string || null;

        // The sellerId now comes from the authenticated user
        const sellerId = user.id;
        const sellerName = user.name;

        if (!nameAr || !descriptionAr || !price || !category || !stock) {
            console.log('❌ Missing required fields');
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        // Use the Cloudinary URL if available, otherwise use placeholder
        const finalImageUrl = imageUrl || '/placeholder.svg?height=400&width=400';

        const newProductData = {
            name: nameAr,
            nameAr: nameAr,
            description: descriptionAr,
            descriptionAr: descriptionAr,
            price: price,
            category: category,
            image: finalImageUrl,
            sellerId: sellerId,
            sellerName: sellerName,
            stock: stock,
            featured: false,
            approved: true,
            createdAt: new Date(),
        }

        // Add to Firestore
        const adminDb = getAdminDb();
        const docRef = await adminDb.collection('products').add(newProductData);
        const createdProduct: Product = { ...newProductData, id: docRef.id };
        
        console.log('✅ Product created successfully:', createdProduct.id);

        return NextResponse.json(createdProduct, { status: 201 });
    } catch (error) {
        console.error('❌ Error creating product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
