import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import { getAuthenticatedUser } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json({
                message: 'Authentication required'
            }, { status: 401 });
        }

        if (user.role !== 'seller') {
            return NextResponse.json({
                message: 'Access denied - seller role required',
                userRole: user.role
            }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('seller_id', user.id);

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
        return NextResponse.json({
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const user = await getAuthenticatedUser(request);

    if (!user || user.role !== 'seller') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (user.status !== 'approved') {
        return NextResponse.json({
            message: 'Seller account pending approval',
            details: 'Your seller account is pending admin approval. You will be able to add products once approved.'
        }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const nameAr = formData.get('nameAr') as string;
        const descriptionAr = formData.get('descriptionAr') as string;
        const price = Number(formData.get('price'));
        const category = formData.get('category') as string;
        const stock = Number(formData.get('stock'));
        const imageUrl = formData.get('imageUrl') as string || null;

        const sellerId = user.id;
        const sellerName = user.name;

        if (!nameAr || !descriptionAr || isNaN(price) || !category || isNaN(stock)) {
            return NextResponse.json({ message: 'Missing or invalid required fields' }, { status: 400 });
        }

        if (price <= 0 || stock < 0) {
            return NextResponse.json({ message: 'Price must be positive and stock cannot be negative' }, { status: 400 });
        }

        const newProduct = {
            name: nameAr,
            name_ar: nameAr,
            description: descriptionAr,
            description_ar: descriptionAr,
            price: price,
            category: category,
            image_url: imageUrl || '/placeholder.svg',
            seller_id: sellerId,
            seller_name: sellerName,
            stock: stock,
            featured: false,
            approved: false,
        }

        const { data, error } = await supabase
            .from('products')
            .insert(newProduct)
            .select()
            .single();

        if (error) throw error;

        const createdProduct: Product = {
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

        return NextResponse.json(createdProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
