"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, DollarSign, ShoppingBag, TrendingUp, Plus, AlertCircle } from "lucide-react"
import { StatsCard } from "@/components/seller/stats-card"
import { ProductForm } from "@/components/seller/product-form"
import { ProductList } from "@/components/seller/product-list"
import { SalesChart } from "@/components/seller/sales-chart"
import { OrderList } from "@/components/seller/order-list"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import type { Product } from "@/lib/types"

// Helper to create authorization headers
const createAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
})

export default function SellerDashboardPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("products")
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()

  useEffect(() => {
    if (!user || user.role !== "seller" || !token) {
      router.push("/login")
      return
    }

    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/products", {
          headers: createAuthHeaders(token),
        })
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const sellerProducts = await response.json()
        // No more client-side filtering needed!
        setProducts(sellerProducts)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [user, token, router])

  const handleAddProduct = async (data: Partial<Product>, imageFile?: File) => {
    if (!token) return

    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })
    if (imageFile) {
      formData.append("image", imageFile)
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: createAuthHeaders(token),
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to create product")
      }

      const newProduct = await response.json()
      setProducts([...products, newProduct])
      setEditingProduct(undefined)
      setActiveTab("products")
      alert("تم إضافة المنتج بنجاح!")
    } catch (error) {
      console.error(error)
      alert("حدث خطأ أثناء إضافة المنتج.")
    }
  }

  const handleEditProduct = async (data: Partial<Product>) => {
    if (!editingProduct || !token) return

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      const updatedProduct = await response.json()
      setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
      setEditingProduct(undefined)
      setActiveTab("products")
      alert("تم تحديث المنتج بنجاح!")
    } catch (error) {
      console.error(error)
      alert("حدث خطأ أثناء تحديث المنتج.")
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!token || !confirm("هل أنت متأكد من حذف هذا المنتج؟")) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: createAuthHeaders(token),
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      setProducts(products.filter((p) => p.id !== productId))
      alert("تم حذف المنتج بنجاح!")
    } catch (error) {
      console.error(error)
      alert("حدث خطأ أثناء حذف المنتج.")
    }
  }

  const handleShowForm = (product?: Product) => {
    setEditingProduct(product)
    setActiveTab("form")
  }

  const handleCancelForm = () => {
    setEditingProduct(undefined)
    setActiveTab("products")
  }

  if (!user || user.role !== "seller") {
    return null // Or a loading spinner
  }

  if (user.status === "pending") {
    return (
      <main className="container mx-auto py-8 px-4 md:px-6">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-lg font-semibold">حسابك قيد المراجعة</AlertTitle>
          <AlertDescription className="mt-2">
            شكراً لتسجيلك كبائعة في سيدتي ماركت. حسابك حالياً قيد المراجعة من قبل فريق الإدارة. سيتم إعلامك عبر البريد
            الإلكتروني فور الموافقة على حسابك وستتمكن من إضافة منتجاتك.
          </AlertDescription>
          <div className="mt-4">
            <Button onClick={() => router.push("/")} variant="outline">
              العودة للصفحة الرئيسية
            </Button>
          </div>
        </Alert>
      </main>
    )
  }

  // Mock calculations - replace with real data from API
  const totalRevenue = products.reduce((sum, p) => sum + p.price * (10 - p.stock), 0)
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)

  return (
    <main className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة تحكم البائع</h1>
          <p className="text-muted-foreground mt-1">أهلاً بك مجدداً، {user.name}!</p>
        </div>
        <Button onClick={() => handleShowForm()} className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          إضافة منتج جديد
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto">
          <TabsTrigger value="products">منتجاتي</TabsTrigger>
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
          <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
          <TabsTrigger value="form" className={editingProduct ? "text-yellow-500" : ""} disabled>
            {editingProduct ? "تعديل المنتج" : "إضافة منتج"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {isLoading ? (
            <p>جاري تحميل المنتجات...</p>
          ) : (
            <ProductList products={products} onEdit={handleShowForm} onDelete={handleDeleteProduct} />
          )}
        </TabsContent>

        <TabsContent value="orders">
          <OrderList />
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard title="إجمالي المنتجات" value={products.length} icon={Package} />
            <StatsCard title="المنتجات المعتمدة" value={products.filter((p) => p.approved).length} icon={ShoppingBag} />
            <StatsCard
              title="إجمالي الإيرادات"
              value={`${totalRevenue.toFixed(2)} د.أ`}
              icon={DollarSign}
              description="+20.1% من الشهر الماضي"
            />
            <StatsCard title="المخزون الكلي" value={totalStock} icon={TrendingUp} />
          </div>
          <SalesChart />
        </TabsContent>

        <TabsContent value="form">
          <ProductForm
            key={editingProduct?.id || "new"}
            product={editingProduct}
            onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
            onCancel={handleCancelForm}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}
