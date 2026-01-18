import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Product, User } from '@/lib/types'
import { getAuthenticatedUser } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

async function authorizeSeller(request: NextRequest, productId: string): Promise<{ user: User, product: Product } | NextResponse> {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'seller') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data: p, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .maybeSingle();

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

        if (product.sellerId !== user.id) {
            return NextResponse.json({ message: 'Product not found or access denied' }, { status: 404 });
        }

        return { user, product };
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const authResult = await authorizeSeller(request, id);
    if (authResult instanceof NextResponse) return authResult;

    const { product } = authResult;
    return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const authResult = await authorizeSeller(request, id);
    if (authResult instanceof NextResponse) return authResult;

    const { product } = authResult;

    try {
        const body = await request.json();
        const { image, nameAr, descriptionAr, ...otherData } = body;

        const updatedData = {
            ...otherData,
            ...(nameAr && { name_ar: nameAr, name: nameAr }),
            ...(descriptionAr && { description_ar: descriptionAr, description: descriptionAr }),
            ...(image && { image_url: image }),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('products')
            .update(updatedData)
            .eq('id', id)
            .select()
            .maybeSingle();

        if (error) throw error;

        const updatedProduct: Product = {
            id: data.id,
            name: data.name,
            nameAr: data.name_ar,
            description: data.description,
            descriptionAr: data.description_ar,
            price: data.price,
            category: data.category,
            image: data.image_url,
            sellerId: data.seller_id,
            sellerName: data.seller_name,
            stock: data.stock,
            featured: data.featured,
            approved: data.approved,
            suspended: data.suspended,
            purchaseCount: data.purchase_count,
            createdAt: new Date(data.created_at)
        };

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const authResult = await authorizeSeller(request, id);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
