"use client"

import { ProductFilters } from "@/components/products/product-filters"
import { ProductGrid } from "@/components/products/product-grid"
import { useLocale } from "@/lib/locale-context"
import type { Product } from "@/lib/types"
import ClientOnly from "@/components/client-only"
import Link from "next/link"
import { motion } from "framer-motion"

interface ProductsViewProps {
    products: Product[]
}

export function ProductsView({ products }: ProductsViewProps) {
    const { t, language } = useLocale()

    const formatProductCount = () => {
        const count = products.length;
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
                                <ProductFilters />
                            </div>
                        </aside>

                        {/* Products Grid */}
                        <div className="lg:col-span-3">
                            <ProductGrid products={products} />
                        </div>
                    </div>
                </div>
            </div>
        </ClientOnly>
    )
}
