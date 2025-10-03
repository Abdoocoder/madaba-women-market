"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { useCart } from "@/lib/cart-context"
import { useLocale } from "@/lib/locale-context"
import type { Product, User } from "@/lib/types"

export type SortOption = "price-asc" | "price-desc" | "date-desc" | "name-asc"

interface HomePageProps {
  user: User | null
}

export default function HomePage({ user }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortOption, setSortOption] = useState<SortOption>("date-desc")
  const { totalItems } = useCart()
  const { t } = useLocale()

  const sortedAndFilteredProducts = useMemo(() => {
    const filtered = MOCK_PRODUCTS.filter((product) => {
      const matchesSearch =
        product.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      return matchesSearch && matchesCategory && product.approved
    })

    return [...filtered].sort((a: Product, b: Product) => {
      switch (sortOption) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "name-asc":
          return a.nameAr.localeCompare(b.nameAr)
        case "date-desc":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  }, [searchQuery, selectedCategory, sortOption])

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={totalItems} user={user} />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t("home.welcome")}
          </h1>
          <p className="text-muted-foreground text-lg">{t("home.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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

          <div className="lg:col-span-3">
            {sortedAndFilteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">{t("home.noProducts")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedAndFilteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
