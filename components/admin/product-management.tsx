"use client"

import Image from "next/image"
import { Check, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"

interface ProductManagementProps {
  products: Product[]
  onApprove: (productId: string) => void
  onReject: (productId: string) => void
  onToggleFeatured: (productId: string) => void
}

export function ProductManagement({ products, onApprove, onReject, onToggleFeatured }: ProductManagementProps) {
  const pendingProducts = products.filter((p) => !p.approved)
  const approvedProducts = products.filter((p) => p.approved)

  return (
    <div className="space-y-6">
      {pendingProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">المنتجات قيد المراجعة ({pendingProducts.length})</h3>
          <div className="space-y-4">
            {pendingProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.nameAr}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{product.nameAr}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{product.descriptionAr}</p>
                          <p className="text-xs text-muted-foreground mt-1">البائع: {product.sellerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-bold text-primary">{product.price} ر.س</span>
                          <span className="text-muted-foreground">الكمية: {product.stock}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => onApprove(product.id)}>
                            <Check className="ml-1 h-4 w-4" />
                            قبول
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => onReject(product.id)}>
                            <X className="ml-1 h-4 w-4" />
                            رفض
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">المنتجات المعتمدة ({approvedProducts.length})</h3>
        <div className="space-y-4">
          {approvedProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.nameAr}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{product.nameAr}</h4>
                          <Badge>معتمد</Badge>
                          {product.featured && (
                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">مميز</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{product.descriptionAr}</p>
                        <p className="text-xs text-muted-foreground mt-1">البائع: {product.sellerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-bold text-primary">{product.price} ر.س</span>
                        <span className="text-muted-foreground">الكمية: {product.stock}</span>
                      </div>
                      <Button
                        size="sm"
                        variant={product.featured ? "default" : "outline"}
                        onClick={() => onToggleFeatured(product.id)}
                      >
                        <Star className={`ml-1 h-4 w-4 ${product.featured ? "fill-current" : ""}`} />
                        {product.featured ? "إلغاء التمييز" : "تمييز"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
