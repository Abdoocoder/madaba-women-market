import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'
import type { Product } from '@/lib/types';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('approved', true);

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

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
