'use client'

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ProductCardProps {
  product: Product
  onRemoveFromWishlist?: (productId: string) => void
}

export function ProductCard({ product, onRemoveFromWishlist }: ProductCardProps) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { t, language } = useLocale()
  const router = useRouter()

  // Early return if product is missing required fields
  if (!product.id || !product.sellerId) {
    console.warn("ProductCard received invalid product, skipping render:", product);
    return null;
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent card click event

    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "customer") {
      // Optionally, show a toast message here
      return
    }

    addToCart(product)
  }

  const rating = 4.5; // Hardcoded rating since it's not in the Product model
  const reviewCount = 0; // Hardcoded review count since it's not in the Product model

  // Updated product URL to point to the nested store product page
  const productUrl = `/store/${product.sellerId}/product/${product.id}`;

  const handleCardClick = () => {
    router.push(productUrl)
  }

  return (
    <Card
      onClick={handleCardClick}
      className="overflow-hidden h-full flex flex-col group border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl bg-card hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div className="absolute inset-0 bg-muted/20 z-0"></div>
        <Image
          src={product.image || "/placeholder.svg"}
          alt={language === "ar" ? product.nameAr : product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => {
            console.error("Error loading image for product:", product.id, product.image);
          }}
        />
        {onRemoveFromWishlist && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 left-2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemoveFromWishlist(product.id)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {product.featured && (
          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white shadow-md font-medium px-2.5 py-1">
            {t("product.featured")}
          </Badge>
        )}
      </div>
      <CardContent className="p-5 flex-grow flex flex-col pt-5">
        <div className="flex justify-between items-start mb-2 gap-2">
          <div>
            {product.sellerName && (
              <Link
                href={`/seller/${product.sellerId}`}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors mb-1 block"
                onClick={(e) => e.stopPropagation()}
              >
                {product.sellerName}
              </Link>
            )}
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {language === "ar" ? product.nameAr : product.name}
            </h3>
          </div>
          <div className="font-bold text-lg text-primary bg-primary/5 px-2 py-1 rounded-lg shrink-0">
            {formatCurrency(product.price)}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 text-balance leading-relaxed">
          {language === "ar" ? product.descriptionAr : product.description}
        </p>

        <div className="flex-grow"></div>

        <div className="flex items-center gap-1 mb-4">
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-current' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
          </div>
          {reviewCount > 0 &&
            <span className="text-xs text-muted-foreground ms-1">
              ({reviewCount})
            </span>
          }
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
            {product.stock > 0 ? t("product.inStock") : t("product.outOfStock")}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full rounded-xl bg-muted/50 text-foreground hover:bg-primary hover:text-primary-foreground border-0 shadow-none hover:shadow-md transition-all h-11 font-medium group/btn"
          disabled={product.stock === 0 || user?.role !== 'customer'}
          aria-label={t('product.addToCart')}
        >
          <ShoppingCart className="me-2 h-4 w-4 transition-transform group-hover/btn:scale-110" />
          {t("product.addToCart")}
        </Button>
      </CardFooter>
    </Card>
  )
}
