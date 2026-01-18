"use client"

import { ProductCard } from "@/components/products/product-card"
import { useLocale } from "@/lib/locale-context"
import type { Product } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { t } = useLocale()

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-muted">
        <p className="text-lg text-muted-foreground font-medium">{t("home.noProducts")}</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Try changing your filters or search term.</p>
      </div>
    )
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {products.map((product) => (
          <motion.div
            layout
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
