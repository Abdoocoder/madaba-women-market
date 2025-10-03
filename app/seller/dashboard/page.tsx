'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, DollarSign, ShoppingBag, TrendingUp, Plus } from "lucide-react"
import { StatsCard } from "@/components/seller/stats-card"
import { ProductForm } from "@/components/seller/product-form"
import { ProductList } from "@/components/seller/product-list"
import { SalesChart } from "@/components/seller/sales-chart"
import { OrderList } from "@/components/seller/order-list"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import type { Product } from "@/lib/types"

export default function SellerDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("products")
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()

  useEffect(() => {
    if (!user || user.role !== "seller") {
      router.push("/login")
      return
    }

    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/products');
        const allProducts = await response.json();
        // Client-side filter for this seller's products
        setProducts(allProducts.filter((p: Product) => p.sellerId === user.id));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        // Handle error (e.g., show a toast notification)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts();
  }, [user, router]);


  const handleAddProduct = async (data: Partial<Product>, imageFile?: File) => {
    if (!user) return

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      setShowForm(false);
      setActiveTab("products");
      alert("تم إضافة المنتج بنجاح!");

    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إضافة المنتج.");
    }
  }

  const handleEditProduct = async (data: Partial<Product>, imageFile?: File) => {
    if (!editingProduct) return
    
    // Note: The backend PUT endpoint doesn't support image updates (multipart/form-data) yet.
    // We are only sending JSON data for now.
    if (imageFile) {
        console.warn("Image updates are not yet supported on edit. Feature coming soon!");
    }

    try {
        const response = await fetch(`/api/products/${editingProduct.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update product');
        }

        const updatedProduct = await response.json();
        setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
        setEditingProduct(undefined);
        setShowForm(false);
        setActiveTab("products");
        alert("تم تحديث المنتج بنجاح!");

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحديث المنتج.");
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete product');
        }

        setProducts(products.filter((p) => p.id !== productId));
        alert("تم حذف المنتج بنجاح!")
    } catch (error) {
        console.error(error);
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
                <TabsTrigger value="form" className={editingProduct ? 'text-yellow-500' : ''} disabled>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج'}</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
                {isLoading ? <p>جاري تحميل المنتجات...</p> : <ProductList products={products} onEdit={handleShowForm} onDelete={handleDeleteProduct} />}
            </TabsContent>

            <TabsContent value="orders">
                <OrderList />
            </TabsContent>

            <TabsContent value="stats">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard title="إجمالي المنتجات" value={products.length} icon={Package} />
                    <StatsCard title="المنتجات المعتمدة" value={products.filter((p) => p.approved).length} icon={ShoppingBag} />
                    <StatsCard title="إجمالي الإيرادات" value={`${totalRevenue.toFixed(2)} د.أ`} icon={DollarSign} description="+20.1% من الشهر الماضي" />
                    <StatsCard title="المخزون الكلي" value={totalStock} icon={TrendingUp} />
                </div>
                <SalesChart />
            </TabsContent>

            <TabsContent value="form">
                <ProductForm
                    key={editingProduct?.id || 'new'}
                    product={editingProduct}
                    onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
                    onCancel={handleCancelForm}
                />
            </TabsContent>
        </Tabs>
    </main>
  )
}
