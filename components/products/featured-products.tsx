"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { useLocale } from "@/lib/locale-context"
import { collection, getDocs, query, where, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"
import { motion } from "framer-motion"

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
            const product = {
              id: doc.id,
              ...productData,
            } as Product;

            // Debugging: Log product data
            console.log("Fetched featured product:", product);

            // Validate that we have all required data
            if (!product.id || (typeof product.id === 'string' && product.id.trim() === '')) {
              console.error("Featured product is missing valid ID:", productData);
              return null; // Skip this product
            }
            if (!product.sellerId) {
              console.error("Featured product is missing sellerId:", product);
              return null; // Skip this product
            }

            return product;
          })
          .filter((product): product is Product => product !== null) // Filter out null products
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
