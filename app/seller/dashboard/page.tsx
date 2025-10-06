"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderList } from "@/components/seller/order-list"
import { ProductForm } from "@/components/seller/product-form"
import { ProductList } from "@/components/seller/product-list"
import { SalesChart } from "@/components/seller/sales-chart"
import { StatsCard } from "@/components/seller/stats-card"
import { Plus, DollarSign, Package, ShoppingCart, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import type { Product } from "@/lib/types"

// Helper function to create auth headers
const createAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
})

export default function SellerDashboardPage() {
  const { user, getAuthToken } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { t } = useLocale()

  useEffect(() => {
    if (!user || user.role !== "seller") {
      router.push("/login")
      return
    }

    // Debug authentication
    const debugAuth = async () => {
      const token = await getAuthToken()
      if (token) {
        try {
          const response = await fetch("/api/debug/auth", {
            headers: createAuthHeaders(token),
          })
          const data = await response.json()
          console.log('Auth debug:', data)
        } catch (error) {
          console.error('Auth debug error:', error)
        }
      }
    }
    debugAuth()

    const fetchProducts = async () => {
      const token = await getAuthToken()
      if (!token) {
        console.error("No auth token available")
        return
      }

      try {
        const response = await fetch("/api/products", {
          headers: createAuthHeaders(token),
        })
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        } else {
          console.error("Products API error:", response.status, response.statusText)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchProducts()
  }, [user, router, getAuthToken])

  const fetchStats = async () => {
    const token = await getAuthToken()
    if (!token) {
      console.error("No auth token available for stats")
      return
    }

    try {
      const response = await fetch("/api/stats", {
        headers: createAuthHeaders(token),
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error("Stats API error:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    if (user?.role === "seller") {
      fetchStats()
    }
  }, [user])

  const handleAddProduct = async (data: Partial<Product>, imageUrl?: string) => {
    const token = await getAuthToken()
    if (!token) return

    const formData = new FormData()
    formData.append("nameAr", data.nameAr || "")
    formData.append("descriptionAr", data.descriptionAr || "")
    formData.append("price", String(data.price || 0))
    formData.append("category", data.category || "")
    formData.append("stock", String(data.stock || 0))
    if (imageUrl) {
      formData.append("imageUrl", imageUrl)
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const newProduct = await response.json()
        setProducts([...products, newProduct])
        setShowAddForm(false)
      }
    } catch (error) {
      console.error("Error adding product:", error)
    }
  }

  const handleEditProduct = async (data: Partial<Product>, imageUrl?: string) => {
    const token = await getAuthToken()
    if (!editingProduct || !token) return

    try {
      const updateData = { 
        id: editingProduct.id, // Include the product ID
        ...data 
      }
      if (imageUrl) {
        updateData.image = imageUrl
      }

      const response = await fetch('/api/products', { // Remove the ID from URL
        method: "PUT",
        headers: createAuthHeaders(token),
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedProduct = await response.json()
        setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)))
        setEditingProduct(null)
      } else {
        const errorData = await response.json()
        console.error('Error updating product:', errorData)
      }
    } catch (error) {
      console.error("Error updating product:", error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    console.log('Deleting product with ID:', productId);
    const token = await getAuthToken();
    if (!token || !confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      console.log('Calling DELETE API with URL:', `/api/products/${productId}`);
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: createAuthHeaders(token),
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId));
      } else {
        console.error("Error deleting product. Status:", response.status);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  if (!user || user.role !== "seller") {
    return <div>{t("common.loading")}</div>
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("seller.dashboard")}</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t("seller.overview")}</TabsTrigger>
          <TabsTrigger value="products">{t("seller.products")}</TabsTrigger>
          <TabsTrigger value="orders">{t("seller.orders")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("seller.analytics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title={t("seller.totalRevenue")}
              value={stats?.totalRevenue ? `$${stats.totalRevenue.toFixed(2)}` : "$0.00"}
              description={t("seller.thisMonth")}
              icon={DollarSign}
            />
            <StatsCard
              title={t("seller.totalOrders")}
              value={stats?.totalOrders?.toString() || "0"}
              description={t("seller.completed")}
              icon={ShoppingCart}
            />
            <StatsCard
              title={t("seller.totalProducts")}
              value={products.length.toString()}
              description={t("seller.active")}
              icon={Package}
            />
            <StatsCard
              title={t("seller.pendingOrders")}
              value={stats?.pendingOrders?.toString() || "0"}
              description={t("seller.needsAttention")}
              icon={Clock}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("seller.recentProducts")}</CardTitle>
                <CardDescription>{t("seller.lastAdded")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {products.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{product.nameAr}</span>
                      <span className="text-sm text-muted-foreground">${product.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales chart temporarily disabled */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Charts will be available soon</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t("seller.products")}</h2>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("seller.addProduct")}
            </Button>
          </div>

          {showAddForm && (
            <ProductForm
              onSubmit={handleAddProduct}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSubmit={handleEditProduct}
              onCancel={() => setEditingProduct(null)}
            />
          )}

          <ProductList
            products={products}
            onEdit={setEditingProduct}
            onDelete={handleDeleteProduct}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <h2 className="text-2xl font-bold">{t("seller.orders")}</h2>
          <OrderList />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">{t("seller.analytics")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Sales chart temporarily disabled */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Charts will be available soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("seller.topProducts")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {products.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{product.nameAr}</span>
                      <span className="text-sm text-muted-foreground">${product.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
