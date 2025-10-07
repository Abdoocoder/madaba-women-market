"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Star } from "lucide-react"
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
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { t, language } = useLocale()
  const router = useRouter()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()

    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "customer") {
      return
    }

    addToCart(product)
  }

  // Generate a random rating for demo purposes (in a real app, this would come from the database)
  const randomRating = Math.floor(Math.random() * 2) + 4; // Between 4-5 stars

  return (
    <div className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="relative aspect-square">
          <Image 
            src={product.image || "/placeholder.svg?height=400&width=400"} 
            alt={product.nameAr} 
            fill 
            className="object-cover" 
            priority={!!product.featured} // Add priority for featured products
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Add sizes for better optimization
          />
          {product.featured && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600">
              {t("product.featured")}
            </Badge>
          )}
        </div>
        <CardContent className="p-4 flex-grow">
          <h3 className="font-semibold text-lg mb-1 text-balance">
            {language === "ar" ? product.nameAr : product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {language === "ar" ? product.descriptionAr : product.description}
          </p>
          
          {/* Seller Info - Using div instead of Link to avoid nested anchor tags */}
          {product.sellerName && (
            <div className="mb-2">
              <span className="text-xs text-muted-foreground me-1">
                {t("product.seller")}:
              </span>
              <Link 
                href={`/seller/${product.sellerId}`} 
                className="text-xs text-primary hover:underline"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                {product.sellerName}
              </Link>
            </div>
          )}
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < randomRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ms-1">
              ({randomRating}.0)
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">{formatCurrency(product.price)}</span>
            <span className="text-xs text-muted-foreground">
              {t("product.inStock")}: {product.stock}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {!user ? (
            <Button onClick={handleAddToCart} className="w-full" disabled={product.stock === 0}>
              <ShoppingCart className="ml-2 h-4 w-4" />
              {product.stock === 0 ? t("product.outOfStock") : t("header.login")}
            </Button>
          ) : user.role === "customer" ? (
            <Button onClick={handleAddToCart} className="w-full" disabled={product.stock === 0}>
              <ShoppingCart className="ml-2 h-4 w-4" />
              {product.stock === 0 ? t("product.outOfStock") : t("product.addToCart")}
            </Button>
          ) : (
            <Button className="w-full" disabled>
              <ShoppingCart className="ml-2 h-4 w-4" />
              {t("product.addToCart")}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}