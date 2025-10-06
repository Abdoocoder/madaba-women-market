"use client"

import { useRouter } from "next/navigation"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { CartItem } from "@/components/cart/cart-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { formatCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function CartPage() {
  const { items, totalItems, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const { t } = useLocale()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "customer") {
      router.push("/login")
    }
  }, [user, router])

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: t("cart.emptyCart"),
        description: t("cart.addItemsFirst"),
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          shippingAddress: {
            // This could be enhanced to get actual address from user profile
            city: "Madaba",
            country: "Jordan"
          }
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: t("cart.orderSuccess"),
          description: t("cart.orderSuccessDesc"),
          variant: "default"
        })
        clearCart()
        router.push("/buyer/dashboard?tab=orders")
      } else {
        throw new Error(data.message || 'Failed to create order')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        title: t("cart.orderError"),
        description: t("cart.orderErrorDesc"),
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!user || user.role !== "customer") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للتسوق
          </Button>
          <h1 className="text-3xl font-bold">سلة التسوق</h1>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">سلة التسوق فارغة</h2>
              <p className="text-muted-foreground mb-4">ابدأي بإضافة منتجات إلى سلتك</p>
              <Button onClick={() => router.push("/")}>تصفح المنتجات</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">عدد المنتجات</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-medium">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الشحن</span>
                    <span className="font-medium">مجاني</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">المجموع الكلي</span>
                    <span className="font-bold text-primary">{formatCurrency(totalPrice)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full" 
                    size="lg"
                    disabled={isProcessing || items.length === 0}
                  >
                    {isProcessing ? t("cart.processing") : t("cart.checkout")}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
