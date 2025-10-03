"use client"

import { useMemo } from "react"
import { ProductCard } from "./product-card"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { useLocale } from "@/lib/locale-context"
import type { Product } from "@/lib/types"

export function FeaturedProducts() {
  const { t } = useLocale()

  const featuredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => product.featured && product.approved)
  }, [])

  if (featuredProducts.length === 0) {
    return null
  }

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">{t("home.featuredProducts")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
