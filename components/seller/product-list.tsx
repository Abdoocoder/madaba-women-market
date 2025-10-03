"use client"

import Image from "next/image"
import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">لا توجد منتجات حالياً</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
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
                    <h3 className="font-semibold text-lg">{product.nameAr}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{product.descriptionAr}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-bold text-primary">{product.price} ر.س</span>
                  <span className="text-muted-foreground">الكمية: {product.stock}</span>
                  <Badge variant={product.approved ? "default" : "secondary"}>
                    {product.approved ? "معتمد" : "قيد المراجعة"}
                  </Badge>
                  {product.featured && <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">مميز</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
