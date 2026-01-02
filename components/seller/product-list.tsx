"use client"

import Image from "next/image"
import { Edit, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return (
      <Card className="border-dashed border-2 shadow-sm bg-muted/20">
        <CardContent className="py-16 text-center flex flex-col items-center">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">No products found</p>
          <p className="text-sm text-muted-foreground mt-1">Add your first product to start selling!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <AnimatePresence>
        {products
          .filter(product => product.id && product.id.trim() !== '')
          .map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow group">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="relative w-full sm:w-32 h-40 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden border bg-muted">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.nameAr}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 150px"
                      />
                      {product.featured && <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 shadow-sm border-none">Featured</Badge>}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-foreground">{product.nameAr}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.descriptionAr}</p>
                          </div>
                          <div className="flex gap-1 ml-2 shrink-0">
                            <Button variant="outline" size="icon" onClick={() => onEdit(product)} className="h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-colors">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => onDelete(product.id)} className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-dashed">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Price</span>
                            <span className="font-bold text-lg text-primary">{formatCurrency(product.price)}</span>
                          </div>
                          <div className="w-px h-8 bg-border"></div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Stock</span>
                            <span className="font-medium text-foreground">{product.stock} units</span>
                          </div>
                        </div>

                        <Badge variant={product.approved ? "default" : "outline"} className={product.approved ? "bg-green-100 text-green-700 hover:bg-green-100 border-transparent dark:bg-green-900/30 dark:text-green-400" : "text-yellow-600 border-yellow-200 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-800 dark:bg-yellow-950/30"}>
                          {product.approved ? "Approved" : "Pending Review"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}
