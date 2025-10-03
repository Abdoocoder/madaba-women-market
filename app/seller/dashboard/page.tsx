"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, DollarSign, ShoppingBag, TrendingUp, Plus } from "lucide-react"
import { Header } from "@/components/layout/header"
import { StatsCard } from "@/components/seller/stats-card"
import { ProductForm } from "@/components/seller/product-form"
import { ProductList } from "@/components/seller/product-list"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

export default function SellerDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()

  useEffect(() => {
    if (!user || user.role !== "seller") {
      router.push("/login")
      return
    }
    // Filter products for this seller
    setProducts(MOCK_PRODUCTS.filter((p) => p.sellerId === user.id))
  }, [user, router])

  const handleAddProduct = (data: Partial<Product>) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: data.nameAr || "",
      nameAr: data.nameAr || "",
      description: data.descriptionAr || "",
      descriptionAr: data.descriptionAr || "",
      price: data.price || 0,
      category: data.category || "",
      image: data.image || "/placeholder.svg?height=400&width=400",
      sellerId: user?.id || "",
      sellerName: user?.name || "",
      stock: data.stock || 0,
      featured: false,
      approved: false,
      createdAt: new Date(),
    }
    setProducts([...products, newProduct])
    setShowForm(false)
    alert("تم إضافة المنتج بنجاح! سيتم مراجعته من قبل الإدارة.")
  }

  const handleEditProduct = (data: Partial<Product>) => {
    if (!editingProduct) return
    setProducts(
      products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              nameAr: data.nameAr || p.nameAr,
              descriptionAr: data.descriptionAr || p.descriptionAr,
              price: data.price || p.price,
              category: data.category || p.category,
              stock: data.stock || p.stock,
              image: data.image || p.image,
            }
          : p,
      ),
    )
    setEditingProduct(undefined)
    setShowForm(false)
    alert("تم تحديث المنتج بنجاح!")
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      setProducts(products.filter((p) => p.id !== productId))
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingProduct(undefined)
  }

  if (!user || user.role !== "seller") {
    return null
  }

  const totalProducts = products.length
  const approvedProducts = products.filter((p) => p.approved).length
  const totalRevenue = products.reduce((sum, p) => sum + p.price * (10 - p.stock), 0) // Mock calculation
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">لوحة البائع</h1>
          <p className="text-muted-foreground">مرحباً {user.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="إجمالي المنتجات" value={totalProducts} icon={Package} />
          <StatsCard title="المنتجات المعتمدة" value={approvedProducts} icon={ShoppingBag} />
          <StatsCard title="إجمالي المبيعات" value={`${totalRevenue} ر.س`} icon={DollarSign} />
          <StatsCard title="المخزون الكلي" value={totalStock} icon={TrendingUp} />
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">منتجاتي</TabsTrigger>
            <TabsTrigger value="add">إضافة منتج</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">قائمة المنتجات</h2>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة منتج جديد
              </Button>
            </div>

            {showForm ? (
              <ProductForm
                product={editingProduct}
                onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
                onCancel={handleCancelForm}
              />
            ) : (
              <ProductList products={products} onEdit={handleEdit} onDelete={handleDeleteProduct} />
            )}
          </TabsContent>

          <TabsContent value="add">
            <ProductForm onSubmit={handleAddProduct} onCancel={() => {}} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
