'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/locale-context'
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
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
  const { t, locale } = useLocale()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'seller') return

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const q = query(
                collection(db, 'orders'), 
                where('sellerId', '==', user.id), 
                orderBy('createdAt', 'desc')
            )
            const querySnapshot = await getDocs(q)
            const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order))
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
        const orderRef = doc(db, 'orders', orderId)
        await updateDoc(orderRef, { status: newStatus })
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
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
                                <TableCell>{new Date(order.createdAt.seconds * 1000).toLocaleDateString(locale)}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={getStatusVariant(order.status)}>{t(`orders.statuses.${order.status}`)}</Badge>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(order.totalPrice, locale)}</TableCell>
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
