import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
        }

        const { data: p, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !p) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        const product: Product = {
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
        };

        // Only return approved products
        if (!product.approved) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
