'use server'

import { NextResponse } from 'next/server'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import type { Product } from '@/lib/types'

// This is a mock database. In a real application, you would use a database.
// Note: This state is NOT shared with other route files. 
// A real database is required to have consistent state across API endpoints.
let products: Product[] = MOCK_PRODUCTS;

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     description: Returns a single product by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested product.
 *       404:
 *         description: Product not found.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const productId = params.id
  const product = products.find((p) => p.id === productId)

  if (product) {
    return NextResponse.json(product)
  } else {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 })
  }
}

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     description: Updates an existing product
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nameAr: { type: 'string' }
 *               descriptionAr: { type: 'string' }
 *               price: { type: 'number' }
 *     responses:
 *       200:
 *         description: The updated product.
 *       404:
 *         description: Product not found.
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const productId = params.id
        const productIndex = products.findIndex((p) => p.id === productId)

        if (productIndex === -1) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 })
        }

        // For this example, we'll assume a JSON body similar to the POST request.
        // A real implementation would also need to handle multipart/form-data for image updates.
        const body = await request.json();

        const originalProduct = products[productIndex];
        const updatedProduct = {
            ...originalProduct,
            ...body,
            updatedAt: new Date(),
        };

        products[productIndex] = updatedProduct;

        return NextResponse.json(updatedProduct)
    } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     description: Deletes a product by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deletion successful.
 *       404:
 *         description: Product not found.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const productId = params.id
    const productIndex = products.findIndex((p) => p.id === productId)

    if (productIndex !== -1) {
        products.splice(productIndex, 1)
        return NextResponse.json({ message: 'Product deleted successfully' })
    } else {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }
}
