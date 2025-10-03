'use server'

import { NextResponse } from 'next/server'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import type { Product } from '@/lib/types'

// This is a mock database. In a real application, you would use a database like PostgreSQL, MongoDB, etc.
let products: Product[] = MOCK_PRODUCTS

/**
 * @swagger
 * /api/products:
 *   get:
 *     description: Returns the list of all products
 *     responses:
 *       200:
 *         description: A list of products.
 */
export async function GET() {
  // In a real app, you might want to add pagination
  return NextResponse.json(products)
}

/**
 * @swagger
 * /api/products:
 *   post:
 *     description: Creates a new product
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nameAr: { type: 'string' }
 *               descriptionAr: { type: 'string' }
 *               price: { type: 'number' }
 *               category: { type: 'string' }
 *               stock: { type: 'number' }
 *               image: { type: 'string', format: 'binary' }
 *     responses:
 *       201:
 *         description: The created product.
 *       400:
 *         description: Bad request (e.g., missing data).
 */
export async function POST(request: Request) {
  try {
    // NOTE: In Next.js 13+, API routes receive a native Request object.
    // To handle multipart/form-data, you would typically use a library like `formidable` or `multer`,
    // but that requires more complex setup. For this example, we'll assume the client
    // has pre-uploaded the image and is sending the URL in a JSON body.

    const formData = await request.formData();
    const nameAr = formData.get('nameAr') as string;
    const descriptionAr = formData.get('descriptionAr') as string;
    const price = Number(formData.get('price'));
    const category = formData.get('category') as string;
    const stock = Number(formData.get('stock'));
    const imageFile = formData.get('image') as File | null;
    // In a real app, you would get the sellerId from the authenticated user session
    const sellerId = 'user-2'; 
    const sellerName = 'متجر الزهور';

    if (!nameAr || !descriptionAr || !price || !category || !stock) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    
    let imageUrl = '/placeholder.svg?height=400&width=400';

    if (imageFile) {
        console.log(`Simulating image upload for: ${imageFile.name}`);
        // ** CLOUDINARY UPLOAD LOGIC WOULD GO HERE **
        // 1. Get credentials from environment variables.
        // 2. Configure Cloudinary SDK.
        // 3. Upload the image buffer.
        // 4. Get the secure URL back.
        // For now, we'll just log it and use a placeholder.
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
      sellerId: sellerId,
      sellerName: sellerName,
      stock: stock,
      featured: false,
      approved: true, // Auto-approved for now
      createdAt: new Date(),
    }

    // Save to our mock database
    products.push(newProduct)

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
