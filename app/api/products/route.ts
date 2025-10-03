'use server'

import { NextResponse, NextRequest } from 'next/server'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import type { Product } from '@/lib/types'
import { getAuthenticatedUser } from '@/lib/server-auth'

// This is a mock database. In a real application, you would use a database.
let products: Product[] = MOCK_PRODUCTS

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

    const sellerProducts = products.filter(p => p.sellerId === user.uid);
    return NextResponse.json(sellerProducts);
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

        // The sellerId now comes from the authenticated user, not a hardcoded value
        const sellerId = user.uid;
        const sellerName = user.name; // Use the authenticated user's name

        if (!nameAr || !descriptionAr || !price || !category || !stock) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        let imageUrl = '/placeholder.svg?height=400&width=400';
        if (imageFile) {
            console.log(`Simulating image upload for: ${imageFile.name}`);
            imageUrl = `https://res.cloudinary.com/demo/image/upload/v1689872413/placeholder.jpg`;
            console.log(`Simulated upload complete. Image URL: ${imageUrl}`);
        }

        const newProduct: Product = {
            id: `prod_${Date.now()}`,
            name: nameAr,
            nameAr: nameAr,
            description: descriptionAr,
            descriptionAr: descriptionAr,
            price: price,
            category: category,
            image: imageUrl,
            sellerId: sellerId, // Use the real seller ID
            sellerName: sellerName,
            stock: stock,
            featured: false,
            approved: true,
            createdAt: new Date(),
        }

        products.push(newProduct);

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
