import { NextResponse } from 'next/server'
import { CATEGORIES } from '@/lib/mock-data'

/**
 * @swagger
 * /api/public/categories:
 *   get:
 *     description: Returns the list of product categories
 *     responses:
 *       200:
 *         description: A list of categories.
 */
export async function GET() {
    try {
        // Return the categories from mock data
        return NextResponse.json(CATEGORIES.map(category => category.id));
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
