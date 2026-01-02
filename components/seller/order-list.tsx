'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/locale-context'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export function OrderList() {
    const { user } = useAuth()
    const { t, language: locale } = useLocale()
    const { toast } = useToast()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user || user.role !== 'seller') return

        const fetchOrders = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('seller_id', user.id)
                    .order('created_at', { ascending: false })

                if (error) throw error

                const fetchedOrders: Order[] = data.map(order => ({
                    id: order.id,
                    customerId: order.customer_id,
                    customerName: order.customer_name,
                    sellerId: order.seller_id,
                    sellerName: order.seller_name,
                    totalPrice: order.total_price,
                    total: order.total_price,
                    status: order.status,
                    shippingAddress: order.shipping_address,
                    customerPhone: order.customer_phone,
                    createdAt: new Date(order.created_at),
                    items: [] // In a full list we might not fetch items or fetch them separately
                }))
                setOrders(fetchedOrders)
            } catch (error) {
                console.error("Error fetching orders: ", error)
                toast({ title: t('common.error'), description: t('orders.fetchError'), variant: 'destructive' })
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [user, t, toast])

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o))
            toast({ title: t('common.success'), description: t('orders.statusUpdated') })
        } catch (error) {
            console.error("Error updating order status: ", error)
            toast({ title: t('common.error'), description: t('orders.statusUpdateError'), variant: 'destructive' })
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-96"><p>{t('common.loading')}</p></div>
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'pending': return 'secondary'
            case 'shipped': return 'default'
            case 'delivered': return 'success'
            case 'cancelled': return 'destructive'
            default: return 'outline'
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('orders.myOrders')}</CardTitle>
            </CardHeader>
            <CardContent>
                {orders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">{t('orders.noOrders')}</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('orders.customer')}</TableHead>
                                <TableHead>{t('orders.date')}</TableHead>
                                <TableHead className="text-center">{t('orders.status')}</TableHead>
                                <TableHead className="text-right">{t('orders.total')}</TableHead>
                                <TableHead className="text-center">{t('orders.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="font-medium">{order.customerName}</div>
                                        <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                                    </TableCell>
                                    <TableCell>{new Date(order.createdAt).toLocaleDateString(locale)}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(order.status) as any}>{t(`orders.statuses.${order.status}`)}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(order.totalPrice || 0)}</TableCell>
                                    <TableCell className="text-center">
                                        <Select
                                            value={order.status}
                                            onValueChange={(value) => handleStatusChange(order.id, value)}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder={t('orders.changeStatus')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">{t('orders.statuses.pending')}</SelectItem>
                                                <SelectItem value="shipped">{t('orders.statuses.shipped')}</SelectItem>
                                                <SelectItem value="delivered">{t('orders.statuses.delivered')}</SelectItem>
                                                <SelectItem value="cancelled">{t('orders.statuses.cancelled')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
