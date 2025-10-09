"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ShoppingBag, ArrowRight, Package, Truck, CreditCard, Trash2 } from "lucide-react"
import { CartItem } from "@/components/cart/cart-item"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/locale-context'
import { formatCurrency } from '@/lib/utils'
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function CartPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user, getAuthToken } = useAuth()
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
      // Get auth token
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
            {t("cart.continueShopping")}
          </Button>
          <h1 className="text-3xl font-bold">{t("header.cart")}</h1>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">{t("cart.emptyCartMessage")}</h2>
              <p className="text-muted-foreground mb-4">{t("cart.startShopping")}</p>
              <Button onClick={() => router.push("/")}>{t("header.products")}</Button>
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
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {t("cart.orderSummary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                    <span className="font-medium">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("cart.shipping")}</span>
                    <span className="font-medium text-green-600">{t("cart.free")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("cart.tax")}</span>
                    <span className="font-medium">{formatCurrency(totalPrice * 0.16)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">{t("cart.total")}</span>
                    <span className="font-bold text-primary">{formatCurrency(totalPrice * 1.16)}</span>
                  </div>
                  
                  {/* Product thumbnails preview */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">{t("cart.itemsInCart")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {items.slice(0, 6).map((item) => (
                        <div key={item.product.id} className="relative w-12 h-12 rounded-md overflow-hidden border">
                          <Image
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.nameAr}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {items.length > 6 && (
                        <div className="flex items-center justify-center w-12 h-12 rounded-md bg-muted text-xs font-medium">
                          +{items.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full" 
                    size="lg"
                    disabled={isProcessing || items.length === 0}
                  >
                    <CreditCard className="ml-2 h-4 w-4" />
                    {isProcessing ? t("cart.processing") : t("cart.checkout")}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearCart}
                    className="w-full"
                  >
                    <Trash2 className="ml-2 h-4 w-4" />
                    {t("cart.clearCart")}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Shipping info card */}
              <Card className="mt-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{t("cart.freeShipping")}</p>
                      <p className="text-xs text-muted-foreground">{t("cart.freeShippingDescription")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
