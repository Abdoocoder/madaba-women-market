"use client"

import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { formatCurrency } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { t, language } = useLocale()

  const handleAddToCart = () => {
    addToCart(product)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square">
        <Image src={product.image || "/placeholder.svg"} alt={product.nameAr} fill className="object-cover" />
        {product.featured && (
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600">
            {language === "ar" ? "مميز" : "Featured"}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 text-balance">
          {language === "ar" ? product.nameAr : product.nameAr}
        </h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {language === "ar" ? product.descriptionAr : product.descriptionAr}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">{formatCurrency(product.price)}</span>
          <span className="text-xs text-muted-foreground">
            {t("product.inStock")}: {product.stock}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {user?.role === "customer" ? (
          <Button onClick={handleAddToCart} className="w-full" disabled={product.stock === 0}>
            <ShoppingCart className="ml-2 h-4 w-4" />
            {product.stock === 0 ? t("product.outOfStock") : t("product.addToCart")}
          </Button>
        ) : (
          <Button className="w-full" disabled>
            <ShoppingCart className="ml-2 h-4 w-4" />
            {t("header.login")}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
