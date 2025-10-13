'use client'

import type React from "react"
import { useState, useEffect } from "react"
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
      className="overflow-hidden h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    >
      <div className="relative aspect-square w-full h-full">
        {/* Debugging: Show image URL */}
        <div className="absolute top-0 left-0 z-10 bg-black/50 text-white text-xs p-1 hidden">
          {product.image || "No image"}
        </div>
        <Image
          src={product.image || "/placeholder.svg"}
          alt={language === "ar" ? product.nameAr : product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            console.error("Error loading image for product:", product.id, product.image);
          }}
        />
        {product.featured && (
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white">
            {t("product.featured")}
          </Badge>
        )}
      </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-lg mb-1 text-balance group-hover:text-primary transition-colors">
          {language === "ar" ? product.nameAr : product.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {language === "ar" ? product.descriptionAr : product.description}
        </p>

        <div className="flex-grow"></div>

        {product.sellerName && product.sellerId && (
          <div className="mb-2 text-xs">
            <span className="text-muted-foreground me-1">
              {t("product.soldBy")}:
            </span>
            <Link 
              href={`/seller/${product.sellerId}`} 
              className="text-primary hover:underline font-medium"
              onClick={(e) => e.stopPropagation()} // Prevent parent Link navigation
            >
              {product.sellerName}
            </Link>
          </div>
        )}
        
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'}`} 
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
          <span className="text-xl font-bold text-primary">{formatCurrency(product.price)}</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {product.stock > 0 ? `${t("product.inStock")}: ${product.stock}`: t("product.outOfStock")}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
          <Button 
            onClick={handleAddToCart} 
            className="w-full"
            disabled={product.stock === 0 || user?.role !== 'customer'}
            aria-label={t('product.addToCart')}
          >
            <ShoppingCart className="me-2 h-4 w-4" />
            {t("product.addToCart")}
          </Button>
      </CardFooter>
    </Card>
  )
}
