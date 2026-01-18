"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { useLocale } from "@/lib/locale-context"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/types"
import { motion } from "framer-motion"

export function FeaturedProducts() {
  const { t } = useLocale()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .eq("approved", true)
          .limit(8)

        if (error) throw error

        const products: Product[] = data.map((p) => ({
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

        setFeaturedProducts(products)
      } catch (error) {
        console.error("Error fetching featured products:", JSON.stringify(error, null, 2))
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])
  // ... rest of the file ...

  if (isLoading || featuredProducts.length === 0) {
    return null
  }

  return (
    <div className="py-16">
      <div className="container">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t("home.featuredProducts")}
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {featuredProducts
            .filter(product => product.id && product.id.trim() !== '') // Filter out products without valid IDs
            .map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -10 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
        </motion.div>
      </div>
    </div>
  )
}
