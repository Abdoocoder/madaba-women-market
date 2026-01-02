
'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/locale-context'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

export default function StoreCheckoutPage() {
    const { items, totalPrice, clearCart, storeSellerId } = useCart()
    const { user } = useAuth()
    const { t, language } = useLocale()
    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()

    const [customerName, setCustomerName] = useState(user?.name || '')
    const [address, setAddress] = useState('')
    const [phone, setPhone] = useState(user?.phone || '')
    const [loading, setLoading] = useState(false)

    if (!user || items.length === 0 || storeSellerId !== params.storeId) {
        if (typeof window !== 'undefined') {
            router.push(`/store/${params.storeId}`)
        }
        return null
    }

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!customerName || !address || !phone) {
            toast({ title: t('common.error'), description: t('checkout.fillAllFields'), variant: 'destructive' })
            return
        }
        setLoading(true)

        try {
            // Fetch seller data from profiles
            const { data: sellerData, error: sellerError } = await supabase
                .from('profiles')
                .select('store_name, name')
                .eq('id', storeSellerId!)
                .single()

            if (sellerError || !sellerData) throw new Error('Seller not found')

            // 1. Create the order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_id: user.id,
                    customer_name: customerName,
                    seller_id: storeSellerId,
                    seller_name: sellerData.store_name || sellerData.name,
                    total_price: totalPrice,
                    status: 'pending',
                    shipping_address: address,
                    customer_phone: phone,
                    payment_method: 'COD'
                })
                .select()
                .single()

            if (orderError) throw orderError

            // 2. Create order items
            if (orderData) {
                const orderItems = items.map(item => ({
                    order_id: orderData.id,
                    product_id: item.product.id,
                    product_name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price
                }))

                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems)

                if (itemsError) throw itemsError
            }

            toast({ title: t('common.success'), description: t('checkout.orderPlacedSuccess') })
            clearCart()
            router.push(`/orders`)
        } catch (error) {
            console.error("Error placing order: ", error)
            toast({ title: t('common.error'), description: t('checkout.orderPlacedError'), variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }
    // ... rest of the file ...

    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            <h1 className="text-3xl font-extrabold tracking-tight mb-8 text-center">{t('checkout.title')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Shipping Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('checkout.shippingInfo')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePlaceOrder} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('checkout.name')}</Label>
                                    <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">{t('checkout.address')}</Label>
                                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">{t('checkout.phone')}</Label>
                                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                </div>
                                <div className="mb-4">
                                    <p className="font-medium">💰 طريقة الدفع: </p>
                                    <p>الدفع عند الاستلام (COD)</p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>{t('checkout.orderSummary')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                {items.map(item => (
                                    <div key={item.product.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Image src={item.product.image || "/placeholder.svg"} alt={item.product.name} width={64} height={64} className="rounded-md object-cover" />
                                            <div>
                                                <p className="font-medium">{item.product.name}</p>
                                                <p className="text-sm text-muted-foreground">{t('checkout.quantity')}: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p>{formatCurrency(item.product.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <p>{t('cart.subtotal')}</p>
                                    <p>{formatCurrency(totalPrice)}</p>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <p>{t('cart.total')}</p>
                                    <p>{formatCurrency(totalPrice)}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handlePlaceOrder} className="w-full" size="lg" disabled={loading}>
                                {loading ? t('checkout.placingOrder') : t('checkout.placeOrder')}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
