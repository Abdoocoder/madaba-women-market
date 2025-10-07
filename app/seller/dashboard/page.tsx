"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderList } from "@/components/seller/order-list"
import { ProductForm } from "@/components/seller/product-form"
import { ProductList } from "@/components/seller/product-list"
import { StatsCard } from "@/components/seller/stats-card"
import { Plus, DollarSign, Package, ShoppingCart, Clock, Store, Users, Eye, TrendingUp, Star } from "lucide-react"
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

  const fetchStats = useCallback(async () => {
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
  }, [getAuthToken])

  useEffect(() => {
    if (user?.role === "seller") {
      fetchStats()
    }
  }, [user, fetchStats])

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
        ...data 
      }
      if (imageUrl) {
        updateData.image = imageUrl
      }

      // Check if we have a valid product ID
      if (!editingProduct?.id) {
        console.error('Product ID is missing');
        return;
      }

      const response = await fetch(`/api/products/${editingProduct.id}`, {
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
    const token = await getAuthToken();
    if (!token || !confirm(t("seller.confirmDelete"))) return;

    try {
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t("seller.dashboard")}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/seller/store-settings">
              <Store className="w-4 h-4 me-2" />
              {t("seller.storeSettings")}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/seller/${user?.id}`}>
              {t("seller.viewStore")}
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t("seller.overview")}</TabsTrigger>
          <TabsTrigger value="products">{t("seller.products")}</TabsTrigger>
          <TabsTrigger value="orders">{t("seller.orders")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("seller.analytics")}</TabsTrigger>
          <TabsTrigger value="store">{t("seller.store")}</TabsTrigger>
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

            <Card>
              <CardHeader>
                <CardTitle>{t("seller.storeAnalytics")}</CardTitle>
                <CardDescription>{t("seller.storePerformance")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{t("seller.storeVisitors")}</span>
                    </div>
                    <span className="font-medium">1,248</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{t("seller.followers")}</span>
                    </div>
                    <span className="font-medium">142</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{t("seller.conversionRate")}</span>
                    </div>
                    <span className="font-medium">3.2%</span>
                  </div>
                </div>
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
            <Card>
              <CardHeader>
                <CardTitle>{t("seller.salesAnalytics")}</CardTitle>
                <CardDescription>{t("seller.monthlySales")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">{t("seller.chartsComingSoon")}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("seller.topProducts")}</CardTitle>
                <CardDescription>{t("seller.bestSelling")}</CardDescription>
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

        <TabsContent value="store" className="space-y-6">
          <h2 className="text-2xl font-bold">{t("seller.storeManagement")}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("seller.storeSettings")}</CardTitle>
                <CardDescription>{t("seller.customizeYourStore")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>{t("seller.storeName")}</span>
                  <span className="font-medium">{user.storeName || user.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("seller.storeDescription")}</span>
                  <span className="font-medium">{user.storeDescription ? t("seller.set") : t("seller.notSet")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("seller.storeCover")}</span>
                  <span className="font-medium">{user.storeCoverImage ? t("seller.set") : t("seller.notSet")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("seller.socialLinks")}</span>
                  <span className="font-medium">
                    {user.instagramUrl || user.whatsappUrl ? t("seller.set") : t("seller.notSet")}
                  </span>
                </div>
                <Button asChild className="w-full mt-4">
                  <Link href="/seller/store-settings">
                    {t("seller.editStoreSettings")}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("seller.storePerformance")}</CardTitle>
                <CardDescription>{t("seller.trackYourGrowth")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>{t("seller.totalSales")}</span>
                  <span className="font-medium">{stats?.totalRevenue ? `$${stats.totalRevenue.toFixed(2)}` : "$0.00"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("seller.totalOrders")}</span>
                  <span className="font-medium">{stats?.totalOrders?.toString() || "0"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("seller.averageRating")}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{user.rating?.toFixed(1) || "0.0"}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("seller.totalFollowers")}</span>
                  <span className="font-medium">142</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
