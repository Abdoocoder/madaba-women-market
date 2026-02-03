import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://madaba-women-market.vercel.app'

    // Fetch all approved products
    const { data: products } = await supabase
        .from('products')
        .select('id, created_at, seller_id')
        .eq('approved', true)

    // Fetch all approved sellers
    const { data: sellers } = await supabase
        .from('profiles')
        .select('id, created_at')
        .eq('role', 'seller')

    const productUrls = (products || []).map((product) => ({
        url: `${baseUrl}/store/${product.seller_id}/product/${product.id}`,
        lastModified: product.created_at,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    const sellerUrls = (sellers || []).map((seller) => ({
        url: `${baseUrl}/seller/${seller.id}`,
        lastModified: seller.created_at,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const staticUrls = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/store`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
    ]

    return [...staticUrls, ...sellerUrls, ...productUrls]
}
