"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Package, DollarSign, TrendingUp } from "lucide-react"
import { Header } from "@/components/layout/header"
import { StatsCard } from "@/components/seller/stats-card"
import { SellerManagement } from "@/components/admin/seller-management"
import { ProductManagement } from "@/components/admin/product-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { MOCK_PRODUCTS, MOCK_SELLERS } from "@/lib/mock-data"
import type { Product, Seller } from "@/lib/types"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [sellers, setSellers] = useState<Seller[]>(MOCK_SELLERS)
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login")
    }
  }, [user, router])

  const handleApproveSeller = (sellerId: string) => {
    setSellers(sellers.map((s) => (s.id === sellerId ? { ...s, approved: true } : s)))
    alert("تم قبول البائع بنجاح!")
  }

  const handleRejectSeller = (sellerId: string) => {
    if (confirm("هل أنت متأكد من رفض هذا البائع؟")) {
      setSellers(sellers.filter((s) => s.id !== sellerId))
      alert("تم رفض البائع")
    }
  }

  const handleApproveProduct = (productId: string) => {
    setProducts(products.map((p) => (p.id === productId ? { ...p, approved: true } : p)))
    alert("تم قبول المنتج بنجاح!")
  }

  const handleRejectProduct = (productId: string) => {
    if (confirm("هل أنت متأكد من رفض هذا المنتج؟")) {
      setProducts(products.filter((p) => p.id !== productId))
      alert("تم رفض المنتج")
    }
  }

  const handleToggleFeatured = (productId: string) => {
    setProducts(products.map((p) => (p.id === productId ? { ...p, featured: !p.featured } : p)))
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const totalSellers = sellers.length
  const pendingSellers = sellers.filter((s) => !s.approved).length
  const totalProducts = products.length
  const pendingProducts = products.filter((p) => !p.approved).length
  const totalRevenue = sellers.reduce((sum, s) => sum + s.totalSales, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">لوحة الإدارة</h1>
          <p className="text-muted-foreground">مرحباً {user.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="إجمالي البائعين"
            value={totalSellers}
            icon={Users}
            description={`${pendingSellers} قيد المراجعة`}
          />
          <StatsCard
            title="إجمالي المنتجات"
            value={totalProducts}
            icon={Package}
            description={`${pendingProducts} قيد المراجعة`}
          />
          <StatsCard title="إجمالي المبيعات" value={`${totalRevenue} ر.س`} icon={DollarSign} />
          <StatsCard title="معدل النمو" value="+12%" icon={TrendingUp} description="هذا الشهر" />
        </div>

        <Tabs defaultValue="sellers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sellers">
              البائعون
              {pendingSellers > 0 && (
                <span className="mr-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {pendingSellers}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="products">
              المنتجات
              {pendingProducts > 0 && (
                <span className="mr-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {pendingProducts}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sellers">
            <SellerManagement sellers={sellers} onApprove={handleApproveSeller} onReject={handleRejectSeller} />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement
              products={products}
              onApprove={handleApproveProduct}
              onReject={handleRejectProduct}
              onToggleFeatured={handleToggleFeatured}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
