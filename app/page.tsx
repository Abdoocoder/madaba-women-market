"use client"
"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import { FeaturedProducts } from "@/components/products/featured-products"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"
import ClientOnly from "@/components/client-only"

export type SortOption = "date-desc" | "price-asc" | "price-desc" | "name-asc"

export default function Home() {
  const { totalItems } = useCart()
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
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
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
    let filtered = products

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
        <Header cartItemCount={isMounted ? totalItems : 0} user={isMounted ? user : null} />

        <main className="container py-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t("home.welcome")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("home.subtitle")}</p>
          </div>

          {/* Featured Products Section */}
          <FeaturedProducts />

          {/* All Products Section */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-8">{t("home.allProducts")}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-24">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
