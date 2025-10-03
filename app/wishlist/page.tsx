"use client"

import { Header } from "@/components/layout/header"
import { ProductCard } from "@/components/products/product-card"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { useCart } from "@/lib/cart-context"
import { useLocale } from "@/lib/locale-context"
import { Separator } from "@/components/ui/separator"

export default function WishlistPage() {
  const { totalItems } = useCart()
  const { t } = useLocale()

  // In a real app, you'd fetch the user's wishlist from your backend
  const wishlistProducts = MOCK_PRODUCTS.filter((p) => p.wishlisted)

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={totalItems} />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t("wishlist.title")}
          </h1>
          <p className="text-muted-foreground text-lg">{t("wishlist.subtitle")}</p>
        </div>

        <Separator className="my-8" />

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{t("wishlist.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
