import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('products')
            .select('*');

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
