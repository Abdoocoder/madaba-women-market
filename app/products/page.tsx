import { supabase } from "@/lib/supabase"
import { ProductsView } from "@/components/products/products-view"
import type { Product, ProductDB, SortOption } from "@/lib/types"

// Force dynamic since we're using searchParams
export const dynamic = 'force-dynamic'

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const searchQuery = typeof params.search === 'string' ? params.search : ''
  const category = typeof params.category === 'string' ? params.category : 'all'
  const sort = (typeof params.sort === 'string' ? params.sort : 'date-desc') as SortOption

  let query = supabase
    .from('products')
    .select('*')
    .eq('approved', true) // Only show approved products
    .eq('suspended', false) // Only show active products (assuming 'suspended' column exists and defaults to false)

  // Apply Search
  if (searchQuery) {
    query = query.or(`name_ar.ilike.%${searchQuery}%,description_ar.ilike.%${searchQuery}%`)
  }

  // Apply Category Filter
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  // Apply Sorting
  switch (sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'name-asc':
      query = query.order('name_ar', { ascending: true })
      break
    case 'date-desc':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return <ProductsView products={[]} />
  }

  // Cast data to ProductDB[]
  const productList = data as unknown as ProductDB[]

  const products: Product[] = productList.map((p) => ({
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
  }))

  return <ProductsView products={products} />
}
