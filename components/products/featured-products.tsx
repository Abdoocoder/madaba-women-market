"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { useLocale } from "@/lib/locale-context"
import { collection, getDocs, query, where, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"

export function FeaturedProducts() {
  const { t } = useLocale()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const productsQuery = query(
          collection(db, "products"),
          where("featured", "==", true),
          where("approved", "==", true),
          limit(8),
        )
        const querySnapshot = await getDocs(productsQuery)
        const products = querySnapshot.docs
          .map((doc) => {
            const productData = doc.data();
            return {
              id: doc.id,
              ...productData,
            };
          })
          .filter((product: any) => product.id) as Product[] // Filter out products without valid IDs
        setFeaturedProducts(products)
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (isLoading || featuredProducts.length === 0) {
    return null
  }

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">{t("home.featuredProducts")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {featuredProducts
          .filter(product => product.id) // Filter out products without valid IDs
          .map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>
    </div>
  )
}
