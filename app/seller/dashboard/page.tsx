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
import { Plus, DollarSign, Package, ShoppingCart, Clock, Store, Users, Eye, TrendingUp, Star, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import type { Product } from "@/lib/types"
import { motion } from "framer-motion"

// Helper function to create auth headers
const createAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
})

interface SellerStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  monthlyData: { month: string; revenue: number }[];
}

export default function SellerDashboardPage() {
  const { user, getAuthToken } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<SellerStats | null>(null)
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
        } else if (response.status === 401) {
          console.error("Unauthorized access to products API - token may have expired")
          // Try to refresh the token and retry
          const newToken = await getAuthToken()
          if (newToken && newToken !== token) {
            const retryResponse = await fetch("/api/products", {
              headers: createAuthHeaders(newToken),
            })
            if (retryResponse.ok) {
              const data = await retryResponse.json()
              setProducts(data)
            } else {
              console.error("Retry failed with status:", retryResponse.status)
            }
          }
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
      } else if (response.status === 401) {
        console.error("Unauthorized access to stats API - token may have expired")
        // Try to refresh the token and retry
        const newToken = await getAuthToken()
        if (newToken && newToken !== token) {
          const retryResponse = await fetch("/api/stats", {
            headers: createAuthHeaders(newToken),
          })
          if (retryResponse.ok) {
            const data = await retryResponse.json()
            setStats(data)
          } else {
            console.error("Retry failed with status:", retryResponse.status)
          }
        }
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
      } else if (response.status === 401) {
        console.error("Unauthorized access to create product API - token may have expired")
      } else if (response.status === 403) {
        const errorData = await response.json();
        alert(errorData.message + "\n" + errorData.details);
      } else {
        console.error("Error creating product. Status:", response.status)
        alert(t("seller.productCreationError"));
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
      } else if (response.status === 401) {
        console.error("Unauthorized access to update product API - token may have expired")
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
      } else if (response.status === 401) {
        console.error("Unauthorized access to delete product API - token may have expired")
      } else {
        console.error("Error deleting product. Status:", response.status);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  if (!user || user.role !== "seller") {
    return <div className="h-screen flex items-center justify-center text-muted-foreground">{t("common.loading")}</div>
  }

  // Check if seller is approved
  const isSellerApproved = user.status === 'approved';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 min-h-screen bg-muted/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("seller.dashboard")}</h1>
          <p className="text-muted-foreground mt-1">Manage your store and keep track of your performance.</p>
        </div>
        <div className="flex bg-card p-1 rounded-lg border shadow-sm">
          <Button asChild variant="ghost" size="sm" className="h-9">
            <Link href="/seller/store-settings">
              <Store className="w-4 h-4 me-2" />
              {t("seller.storeSettings")}
            </Link>
          </Button>
          <div className="w-px bg-border my-1"></div>
          <Button asChild variant="ghost" size="sm" className="h-9 text-primary font-medium hover:text-primary/80">
            <Link href={`/seller/${user?.id}`}>
              {t("seller.viewStore")} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-12 p-1 bg-muted/50 rounded-xl">
          {['overview', 'products', 'orders', 'analytics', 'store'].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
            >
              {t(`seller.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div variants={itemVariants}>
              <StatsCard
                title={t("seller.totalRevenue")}
                value={stats?.totalRevenue ? `$${stats.totalRevenue.toFixed(2)}` : "$0.00"}
                description={t("seller.thisMonth")}
                icon={DollarSign}
                trend={{ value: 12, label: "vs last month", positive: true }}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard
                title={t("seller.totalOrders")}
                value={stats?.totalOrders?.toString() || "0"}
                description={t("seller.completed")}
                icon={ShoppingCart}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard
                title={t("seller.totalProducts")}
                value={products.length.toString()}
                description={t("seller.active")}
                icon={Package}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard
                title={t("seller.pendingOrders")}
                value={stats?.pendingOrders?.toString() || "0"}
                description={t("seller.needsAttention")}
                icon={Clock}
                trend={{ value: 2, label: "new", positive: false }}
              />
            </motion.div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {t("seller.recentProducts")}
                </CardTitle>
                <CardDescription>{t("seller.lastAdded")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                          {/* In a real app we'd use the image here */}
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{product.nameAr}</p>
                          <span className="text-xs text-muted-foreground">{product.category}</span>
                        </div>
                      </div>
                      <span className="font-bold text-primary">${product.price}</span>
                    </div>
                  ))}
                  {products.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No products yet.</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {t("seller.storeAnalytics")}
                </CardTitle>
                <CardDescription>{t("seller.storePerformance")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Eye className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{t("seller.storeVisitors")}</span>
                    </div>
                    <span className="font-bold text-lg">1,248</span>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{t("seller.followers")}</span>
                    </div>
                    <span className="font-bold text-lg">142</span>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{t("seller.conversionRate")}</span>
                    </div>
                    <span className="font-bold text-lg">3.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">{t("seller.products")}</h2>
            {isSellerApproved ? (
              <Button onClick={() => setShowAddForm(true)} className="shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                {t("seller.addProduct")}
              </Button>
            ) : (
              <Button disabled title={t("seller.pendingApprovalMessage")} variant="secondary">
                <Plus className="mr-2 h-4 w-4" />
                {t("seller.addProduct")}
              </Button>
            )}
          </div>

          {!isSellerApproved && (
            <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2" />
                <h3 className="font-medium text-yellow-800 dark:text-yellow-400">{t("seller.pendingApprovalTitle")}</h3>
              </div>
              <p className="text-yellow-700 dark:text-yellow-500/80 mt-1 text-sm">{t("seller.pendingApprovalMessage")}</p>
            </div>
          )}

          {showAddForm && (
            <div className="bg-card p-6 rounded-xl border shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">New Product</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
              <ProductForm
                onSubmit={handleAddProduct}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}

          {editingProduct && (
            <div className="bg-card p-6 rounded-xl border shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Product</h3>
                <Button variant="ghost" size="sm" onClick={() => setEditingProduct(null)}>Cancel</Button>
              </div>
              <ProductForm
                product={editingProduct}
                onSubmit={handleEditProduct}
                onCancel={() => setEditingProduct(null)}
              />
            </div>
          )}

          <ProductList
            products={products}
            onEdit={setEditingProduct}
            onDelete={handleDeleteProduct}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>{t("seller.orders")}</CardTitle>
              <CardDescription>Manage your orders and track shipments.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>{t("seller.salesAnalytics")}</CardTitle>
                <CardDescription>{t("seller.monthlySales")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex flex-col items-center justify-center bg-muted/20 rounded-lg border border-dashed">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">{t("seller.chartsComingSoon")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>{t("seller.topProducts")}</CardTitle>
                <CardDescription>{t("seller.bestSelling")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 5).map((product, i) => (
                    <div key={product.id} className="flex items-center justify-between p-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-muted-foreground w-4">{i + 1}</span>
                        <span className="text-sm font-medium">{product.nameAr}</span>
                      </div>
                      <span className="text-sm font-bold">${product.price}</span>
                    </div>
                  ))}
                  {products.length === 0 && <p className="text-center text-muted-foreground py-4">No data available</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="store" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-md h-full">
              <CardHeader>
                <CardTitle>{t("seller.storeSettings")}</CardTitle>
                <CardDescription>{t("seller.customizeYourStore")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground text-sm">{t("seller.storeName")}</span>
                  <span className="font-semibold text-lg">{user.storeName || user.name}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground text-sm">{t("seller.storeDescription")}</span>
                  <Badge variant={user.storeDescription ? "secondary" : "outline"}>{user.storeDescription ? t("seller.set") : t("seller.notSet")}</Badge>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground text-sm">{t("seller.storeCover")}</span>
                  <Badge variant={user.storeCoverImage ? "secondary" : "outline"}>{user.storeCoverImage ? t("seller.set") : t("seller.notSet")}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{t("seller.socialLinks")}</span>
                  <Badge variant={user.instagramUrl || user.whatsappUrl ? "secondary" : "outline"}>
                    {user.instagramUrl || user.whatsappUrl ? t("seller.set") : t("seller.notSet")}
                  </Badge>
                </div>
                <Button asChild className="w-full mt-6 shadow-md shadow-primary/10">
                  <Link href="/seller/store-settings">
                    <Store className="w-4 h-4 mr-2" />
                    {t("seller.editStoreSettings")}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md h-full">
              <CardHeader>
                <CardTitle>{t("seller.storePerformance")}</CardTitle>
                <CardDescription>{t("seller.trackYourGrowth")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground text-sm">{t("seller.totalSales")}</span>
                  <span className="font-bold text-xl text-primary">{stats?.totalRevenue ? `$${stats.totalRevenue.toFixed(2)}` : "$0.00"}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground text-sm">{t("seller.totalOrders")}</span>
                  <span className="font-bold text-lg">{stats?.totalOrders?.toString() || "0"}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground text-sm">{t("seller.averageRating")}</span>
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/10 px-2 py-0.5 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-yellow-700 dark:text-yellow-500">{user.rating?.toFixed(1) || "0.0"}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{t("seller.totalFollowers")}</span>
                  <span className="font-bold text-lg">142</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
