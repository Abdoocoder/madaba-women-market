"use client"

import { useState, useMemo, useEffect } from "react"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import { FeaturedProducts } from "@/components/products/featured-products"
import { SuccessStories } from "@/components/success-stories"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
  const { t, language } = useLocale()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortOption, setSortOption] = useState<SortOption>("date-desc")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsQuery = query(collection(db, "products"), where("approved", "==", true))
        const querySnapshot = await getDocs(productsQuery)
        const fetchedProducts = querySnapshot.docs
          .map((doc) => {
            const productData = doc.data();
            return {
              id: doc.id,
              ...productData,
            };
          })
          .filter((product: any) => product.id) as Product[] // Filter out products without valid IDs
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
    let filtered = products.filter(product => product.id) // Filter out products without valid IDs

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
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{t("common.loading")}</p>
                  </div>
                ) : filteredAndSortedProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{t("home.noProducts")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
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
