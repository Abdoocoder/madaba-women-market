"use client"

import { useState, useMemo, useEffect } from "react"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import { useLocale } from "@/lib/locale-context"
import type { Product } from "@/lib/types"
import ClientOnly from "@/components/client-only"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export type SortOption = "date-desc" | "price-asc" | "price-desc" | "name-asc"

export default function ProductsPage() {
  const { t, language } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/public/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const fetchedProducts = await response.json();
        // Filter out products without valid IDs
        const validProducts = fetchedProducts.filter((product: { id: string }) => product.id);
        setProducts(validProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/public/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const fetchedCategories = await response.json();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

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

  // Format the product count text without using translation interpolation
  const formatProductCount = () => {
    const count = filteredAndSortedProducts.length;
    if (language === "ar") {
      return `تم العثور على ${count} منتج`;
    }
    return `${count} products found`;
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/" className="text-primary hover:text-primary/80 transition-colors hover:underline inline-flex items-center gap-1 mb-4 text-sm font-medium">
              <span>←</span> {t("common.backToHome")}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent w-fit">
              {t("home.allProducts")}
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">
              {formatProductCount()}
            </p>
          </motion.div>

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
              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">{t("common.loading")}</p>
                </div>
              ) : filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-muted">
                  <p className="text-lg text-muted-foreground font-medium">{t("home.noProducts")}</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Try changing your filters or search term.</p>
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence>
                    {filteredAndSortedProducts.map((product) => (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  )
}
