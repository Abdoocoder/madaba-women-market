import { supabase } from "@/lib/supabase"
import { HomeView } from "@/components/home/home-view"
import type { Product } from "@/lib/types"

// Force dynamic since we're fetching data that might change
// or use revalidate. For now, we want fresh data primarily.
export const dynamic = 'force-dynamic'

export default async function Home() {
  let initialProducts: Product[] = []

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("approved", true)

    if (error) {
      console.error("Supabase error fetching products (Server):", error)
    } else if (data) {
      console.log(`✅ Fetched ${data.length} products on Server`)
      initialProducts = data.map((p: any) => ({
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
    }
  } catch (err) {
    console.error("Server Fetch Error:", err)
  }

  return <HomeView initialProducts={initialProducts} />
}
