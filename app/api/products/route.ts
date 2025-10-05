'use server'

import { NextResponse, NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
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
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'seller') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const productsRef = adminDb.collection('products');
        const query = productsRef.where('sellerId', '==', user.id);
        const snapshot = await query.get();
        
        const products: Product[] = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
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
        const docRef = await adminDb.collection('products').add(newProduct);
        const createdProduct = { ...newProduct, id: docRef.id };

        return NextResponse.json(createdProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
