import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { Product } from '@/lib/types'
import { z } from 'zod'
import { productQuerySchema } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Input validation using Zod
        const queryParams = {
            page: searchParams.get('page'),
            limit: searchParams.get('limit'),
            category: searchParams.get('category'),
            search: searchParams.get('search'),
            sellerId: searchParams.get('sellerId'),
        };

        const validatedQuery = productQuerySchema.parse(queryParams);
        const { page, limit, category, search, sellerId } = validatedQuery;

        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        // Base query
        let query = supabase
            .from('products')
            .select('*', { count: 'exact' });

        // Filters
        if (sellerId) {
            query = query.eq('seller_id', sellerId);
        }
        if (category) {
            query = query.eq('category', category);
        }
        if (search) {
            query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%,description.ilike.%${search}%,description_ar.ilike.%${search}%`);
        }

        // Pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        const products: Product[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            nameAr: p.name_ar,
            description: p.description,
            descriptionAr: p.description_ar,
            price: p.price,
            category: p.category,
            image: p.image_url,
            sellerId: p.seller_id,
            sellerName: p.seller_name,
            stock: p.stock,
            featured: p.featured,
            approved: p.approved,
            suspended: p.suspended,
            purchaseCount: p.purchase_count,
            createdAt: new Date(p.created_at)
        }));

        return NextResponse.json({
            items: products,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: count ? Math.ceil(count / limit) : 0
            }
        });
    } catch (error: any) {
        console.error('Error fetching products:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                message: 'Invalid query parameters',
                errors: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { productId, action, value } = await request.json();

        if (!productId) {
            return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
        }

        let updateData = {};
        switch (action) {
            case 'approve':
                updateData = { approved: true };
                break;
            case 'reject':
                updateData = { approved: false };
                break;
            case 'suspend':
                updateData = { suspended: value };
                break;
            case 'feature':
                updateData = { featured: value };
                break;
            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

        const { error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', productId);

        if (error) throw error;

        return NextResponse.json({ message: `Product ${action}d successfully` });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id');

        if (!productId) {
            return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
