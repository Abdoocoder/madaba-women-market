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

export type SortOption = "date-desc" | "price-asc" | "price-desc" | "name-asc"

// Simple interpolation function for translations
function interpolateTranslation(translation: string, params: Record<string, string | number>): string {
  let result = translation
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`{${key}}`, String(value))
  }
  return result
}

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
  // ... rest of the file ...

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
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to Madaba Women Market
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container relative py-16 md:py-24 lg:py-28">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
                {t("home.welcome")}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 text-white/90">
                {t("home.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                  <Link href="/products">{t("home.allProducts")}</Link>
                </Button>
                {user ? (
                  <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                    <Link href="/profile">{t("header.profile")}</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                    <Link href="/login">{t("header.login")}</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 md:h-16 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        <main className="container py-6 md:py-8">
          {/* Featured Products Section */}
          <FeaturedProducts />

          {/* Success Stories Section */}
          <SuccessStories />

          {/* Seller Registration CTA Section */}
          {!user || user.role !== "seller" ? (
            <section className="mt-10 md:mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 md:p-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-purple-900">
                  {t("home.becomeSellerTitle")}
                </h2>
                <p className="text-muted-foreground mb-6 md:mb-8">
                  {t("home.becomeSellerDescription")}
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Link href="/seller/register">
                    {t("common.becomeSeller")}
                  </Link>
                </Button>
              </div>
            </section>
          ) : null}

          {/* All Products Section */}
          <div className="mt-10 md:mt-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">{t("home.allProducts")}</h2>
              <p className="text-muted-foreground mt-1 md:mt-0">
                {interpolateTranslation(t("home.productsCount"), { count: filteredAndSortedProducts.length })}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-20 md:top-24">
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
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{t("home.noProducts")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredAndSortedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
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
