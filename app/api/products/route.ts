import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Product, ProductDB } from '@/lib/types'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { productSchema } from '@/lib/schemas'

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

        // Explicitly cast to ProductDB[] to avoid 'any'
        // In a real app, generate types from Supabase CLI
        const productsList = data as unknown as ProductDB[];

        const products: Product[] = productsList.map((p) => ({
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
        const rawData = {
            nameAr: formData.get('nameAr'),
            descriptionAr: formData.get('descriptionAr'),
            price: formData.get('price'),
            category: formData.get('category'),
            stock: formData.get('stock'),
            imageUrl: formData.get('imageUrl') || null,
        }

        const validData = productSchema.parse(rawData)

        const sellerId = user.id;
        const sellerName = user.name;

        const newProduct = {
            name: validData.nameAr, // Use Arabic name as main name for now
            name_ar: validData.nameAr,
            description: validData.descriptionAr, // Use Arabic desc as main desc
            description_ar: validData.descriptionAr,
            price: validData.price,
            category: validData.category,
            image_url: validData.imageUrl || '/placeholder.svg',
            seller_id: sellerId,
            seller_name: sellerName,
            stock: validData.stock,
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
