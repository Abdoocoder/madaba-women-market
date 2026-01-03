"use client"

import { useState, useMemo, useEffect } from "react"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import { FeaturedProducts } from "@/components/products/featured-products"
import { ProductGridSkeleton } from "@/components/products/product-grid-skeleton"
import { SuccessStories } from "@/components/success-stories"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/types"
import ClientOnly from "@/components/client-only"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { interpolateTranslation } from "@/lib/utils"

export type SortOption = "date-desc" | "price-asc" | "price-desc" | "name-asc"

// Simple interpolation function for translations

export default function Home() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortOption, setSortOption] = useState<SortOption>("date-desc")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("approved", true)

        if (error) throw error

        const fetchedProducts: Product[] = data.map((p) => ({
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

        setProducts(fetchedProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => product.id && product.id.trim() !== '') // Filter out products without valid IDs

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "name-asc":
          return a.nameAr.localeCompare(b.nameAr)
        default:
          return 0
      }
    })

    return sorted
  }, [products, searchQuery, selectedCategory, sortOption])

  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="h-32 w-32 bg-primary/20 rounded-full mx-auto mb-4"></div>
          <h1 className="text-4xl font-bold mb-4 text-primary">
            Madaba Women Market
          </h1>
          <p className="text-muted-foreground">Loading specific experience...</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground pt-16 md:pt-20">
          {/* Visual Hero Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="/madaba-hero.png"
              alt="Madaba Heritage"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent"></div>
          </div>

          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
            <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-secondary blur-2xl"></div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>

          <div className="container relative py-24 md:py-40">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl relative z-10"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-md">
                {t("home.welcome")}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-8 text-primary-foreground/90 leading-relaxed drop-shadow-sm">
                {t("home.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <Link href="/products">{t("home.allProducts")}</Link>
                </Button>
                {user ? (
                  <Button asChild variant="outline" size="lg" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-white/10 text-lg px-8 py-6 rounded-xl backdrop-blur-sm">
                    <Link href={
                      user.role === "admin" ? "/admin/dashboard" :
                        user.role === "seller" ? "/seller/dashboard" :
                          "/buyer/dashboard"
                    }>
                      {user.role === "customer" ? t("dashboard.title") : t("header.profile")}
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="lg" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-white/10 text-lg px-8 py-6 rounded-xl backdrop-blur-sm">
                    <Link href="/login">{t("header.login")}</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        <main className="container py-12 md:py-16 space-y-16">
          {/* Featured Products Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <FeaturedProducts />
          </motion.div>

          {/* Success Stories Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SuccessStories />
          </motion.div>

          {/* Seller Registration CTA Section */}
          {!user || user.role !== "seller" ? (
            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl bg-secondary/10 border border-secondary/20 p-8 md:p-12"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.3,82.2,22.9,71.2,34.5C60.2,46.1,49.5,55.7,37.4,63.4C25.3,71.1,11.8,76.9,-1,78.6C-13.8,80.3,-26.4,77.9,-38.1,72.4C-49.8,66.9,-60.6,58.3,-69.5,47.8C-78.4,37.3,-85.4,24.9,-86.6,11.8C-87.8,-1.3,-83.2,-15.1,-75.4,-27.2C-67.6,-39.3,-56.6,-49.7,-44.6,-57.8C-32.6,-65.9,-19.6,-71.7,-6,-61.3L44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
              </div>

              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary font-display">
                  {t("home.becomeSellerTitle")}
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  {t("home.becomeSellerDescription")}
                </p>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-lg hover:translate-y-[-2px] transition-all">
                  <Link href="/seller/register">
                    {t("common.becomeSeller")}
                  </Link>
                </Button>
              </div>
            </motion.section>
          ) : null}

          {/* All Products Section */}
          <div className="mt-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground font-display">{t("home.allProducts")}</h2>
                <p className="text-muted-foreground mt-2">
                  {interpolateTranslation(t("home.productsCount"), { count: filteredAndSortedProducts.length })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <ProductFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                  />
                </div>
              </aside>

              {/* Products Grid */}
              <div className="lg:col-span-3">
                {isLoading ? (
                  <ProductGridSkeleton />
                ) : filteredAndSortedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-muted rounded-3xl bg-muted/5">
                    <p className="text-xl font-medium text-muted-foreground mb-2">{t("home.noProducts")}</p>
                    <p className="text-sm text-muted-foreground/70">Try adjusting your filters or search query.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredAndSortedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ClientOnly>
  )
}

