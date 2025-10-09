"use client"

import Image from "next/image"
import { Check, X, Star, ShieldAlert, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import toast from "react-hot-toast"
import { useLocale } from "@/lib/locale-context"

interface ProductManagementProps {
  products: Product[]
  onProductsUpdate: () => void
}

export function ProductManagement({ products, onProductsUpdate }: ProductManagementProps) {
  const { getAuthToken } = useAuth()
  const { t } = useLocale()

  // Filter out products without valid IDs to prevent React key errors
  const validProducts = products.filter(product => product.id && product.id.trim() !== '')

  const handleApiAction = async (productId: string, action: string, value?: boolean) => {
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, action, value }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} product: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      toast.success(result.message)
      onProductsUpdate() // Refresh the product list
    } catch (error) {
      console.error(`Error ${action}ing product:`, error)
      toast.error(`Failed to ${action} product.`)
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      toast.success(result.message)
      onProductsUpdate() // Refresh the product list
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product.')
    }
  }

  const pendingProducts = validProducts.filter((p) => !p.approved)
  const approvedProducts = validProducts.filter((p) => p.approved)

  return (
    <div className="space-y-6">
      {pendingProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">{t("admin.reviewPending")} ({pendingProducts.length})</h3>
          <div className="space-y-4">
            {pendingProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg?height=200&width=200"}
                        alt={product.nameAr}
                        fill
                        className="object-cover rounded-md"
                        sizes="100px"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{product.nameAr}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{product.descriptionAr}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t("product.seller")}: {product.sellerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                          <span className="text-muted-foreground">{t("product.stock")}: {product.stock}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApiAction(product.id, 'approve')}>
                            <Check className="ml-1 h-4 w-4" />
                            {t("admin.accept")}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleApiAction(product.id, 'reject')}>
                            <X className="ml-1 h-4 w-4" />
                            {t("admin.decline")}
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
        <h3 className="text-lg font-semibold mb-4">{t("admin.reviewApproved")} ({approvedProducts.length})</h3>
        <div className="space-y-4">
          {approvedProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={product.image || "/placeholder.svg?height=200&width=200"}
                      alt={product.nameAr}
                      fill
                      className="object-cover rounded-md"
                      sizes="100px"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{product.nameAr}</h4>
                          {product.suspended ? (
                            <Badge variant="destructive">{t("admin.suspended")}</Badge>
                          ) : (
                            <Badge>{t("admin.approved")}</Badge>
                          )}
                          {product.featured && (
                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">{t("admin.featured")}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{product.descriptionAr}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("product.seller")}: {product.sellerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                        <span className="text-muted-foreground">{t("product.stock")}: {product.stock}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={product.featured ? "default" : "outline"}
                          onClick={() => handleApiAction(product.id, 'feature', !product.featured)}
                        >
                          <Star className={`ml-1 h-4 w-4 ${product.featured ? "fill-current" : ""}`} />
                          {product.featured ? t("admin.unfeatureProduct") : t("admin.featureProduct")}
                        </Button>
                         <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleApiAction(product.id, 'suspend', !product.suspended)}
                        >
                          <ShieldAlert className="ml-1 h-4 w-4" />
                          {product.suspended ? t("admin.unsuspendProduct") : t("admin.suspendProduct")}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="ml-1 h-4 w-4" />
                          {t("admin.deleteProduct")}
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
    </div>
  )
}
