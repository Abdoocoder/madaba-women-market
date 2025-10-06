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
            products.push({ id: doc.id, ...doc.data() } as Product);
        });
        
        console.log(`✅ Found ${products.length} products for seller ${user.id}`);

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
        const imageFile = formData.get('image') as File | null;

        // The sellerId now comes from the authenticated user
        const sellerId = user.id;
        const sellerName = user.name;

        if (!nameAr || !descriptionAr || !price || !category || !stock) {
            console.log('❌ Missing required fields');
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        let imageUrl = '/placeholder.svg?height=400&width=400';
        if (imageFile) {
            // For now, use a placeholder. In a real implementation, you would:
            // 1. Upload directly to Cloudinary from the client
            // 2. Or implement server-side upload here with proper authentication
            imageUrl = `/api/placeholder-image/${Date.now()}`;
            console.log(`Image uploaded: ${imageFile.name}`);
        }

        const newProduct: Product = {
            id: '', // Firestore will generate the ID
            name: nameAr,
            nameAr: nameAr,
            description: descriptionAr,
            descriptionAr: descriptionAr,
            price: price,
            category: category,
            image: imageUrl,
            sellerId: sellerId,
            sellerName: sellerName,
            stock: stock,
            featured: false,
            approved: true,
            createdAt: new Date(),
        }

        // Add to Firestore
        const adminDb = getAdminDb();
        const docRef = await adminDb.collection('products').add(newProduct);
        const createdProduct = { ...newProduct, id: docRef.id };
        
        console.log('✅ Product created successfully:', createdProduct.id);

        return NextResponse.json(createdProduct, { status: 201 });
    } catch (error) {
        console.error('❌ Error creating product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/products:
 *   put:
 *     description: Updates an existing product for the authenticated seller
 *     responses:
 *       200:
 *         description: The updated product.
 *       400:
 *         description: Bad request (e.g., missing data).
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Product not found.
 */
export async function PUT(request: NextRequest) {
    console.log('=== PUT /api/products ===');
    const user = await getAuthenticatedUser(request);
    console.log('User from auth:', user);
    
    if (!user || user.role !== 'seller') {
        console.log('❌ Authentication failed for PUT request');
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, nameAr, descriptionAr, price, category, stock, image } = body;

        if (!id) {
            console.log('❌ Product ID is required');
            return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
        }

        if (!nameAr || !descriptionAr || !price || !category || stock === undefined) {
            console.log('❌ Missing required fields');
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const productRef = adminDb.collection('products').doc(id);
        const productDoc = await productRef.get();
        
        if (!productDoc.exists) {
            console.log('❌ Product not found');
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        const productData = productDoc.data() as Product;
        
        // Verify that the product belongs to the authenticated seller
        if (productData.sellerId !== user.id) {
            console.log('❌ Access denied - product does not belong to user');
            return NextResponse.json({ message: 'Access denied - you can only update your own products' }, { status: 403 });
        }

        const updatedProduct: Partial<Product> = {
            name: nameAr,
            nameAr: nameAr,
            description: descriptionAr,
            descriptionAr: descriptionAr,
            price: Number(price),
            category: category,
            stock: Number(stock),
            ...(image && { image: image }), // Only update image if provided
        };

        // Update the product in Firestore
        await productRef.update(updatedProduct);
        
        // Get the updated product
        const updatedDoc = await productRef.get();
        const finalProduct = { id: updatedDoc.id, ...updatedDoc.data() } as Product;
        
        console.log('✅ Product updated successfully:', finalProduct.id);

        return NextResponse.json(finalProduct, { status: 200 });
    } catch (error) {
        console.error('❌ Error updating product:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}