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
        const user = await getAuthenticatedUser(request);
        
        if (!user) {
            return NextResponse.json({ 
                message: 'Authentication required',
                solution: 'Make sure Firebase Admin is properly configured with valid credentials in your .env.local file'
            }, { status: 401 });
        }
        
        if (user.role !== 'seller') {
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
        snapshot.forEach((doc) => {
            const productData = doc.data();
            // Only add products with valid data
            if (productData) {
                products.push({ id: doc.id, ...productData } as Product);
            }
        });
        
        // Filter out any products without valid IDs (shouldn't happen, but just in case)
        const validProducts = products.filter(product => product.id);

        return NextResponse.json(validProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
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
    const user = await getAuthenticatedUser(request);
    
    if (!user || user.role !== 'seller') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if seller is approved before allowing product creation
    if (user.status !== 'approved') {
        return NextResponse.json({ 
            message: 'Seller account pending approval',
            details: 'Your seller account is pending admin approval. You will be able to add products once approved.'
        }, { status: 403 });
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

        // Validate required fields
        if (!nameAr || !descriptionAr || isNaN(price) || !category || isNaN(stock)) {
            return NextResponse.json({ message: 'Missing or invalid required fields' }, { status: 400 });
        }
        
        // Validate price and stock are positive
        if (price <= 0 || stock < 0) {
            return NextResponse.json({ message: 'Price must be positive and stock cannot be negative' }, { status: 400 });
        }

        const newProductData = {
            name: nameAr,
            nameAr: nameAr,
            description: descriptionAr,
            descriptionAr: descriptionAr,
            price: price,
            category: category,
            image: imageUrl || '/placeholder.svg',
            sellerId: sellerId,
            sellerName: sellerName,
            stock: stock,
            featured: false,
            approved: false, // New products require admin approval
            createdAt: new Date(),
        }

        // Add to Firestore
        const adminDb = getAdminDb();
        const docRef = await adminDb.collection('products').add(newProductData);
        const createdProduct: Product = { ...newProductData, id: docRef.id };

        return NextResponse.json(createdProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
