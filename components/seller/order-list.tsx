'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocale } from '@/lib/locale-context'

// Define the types for our order and its status
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: OrderStatus;
}

export function OrderList() {
  const { t } = useLocale()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/orders')
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        const data = await response.json()
        setOrders(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistically update the UI
    const originalOrders = [...orders]
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    )
    setOrders(updatedOrders)

    // Make the API call
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        // If the API call fails, revert the change
        setOrders(originalOrders)
        console.error('Failed to update order status')
        // You might want to show a toast notification to the user here
      }
    } catch (err) {
      // Revert on network error
      setOrders(originalOrders)
      console.error('An error occurred while updating status:', err)
    }
  }

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'destructive'
      case 'processing': return 'secondary'
      case 'shipped': return 'default'
      case 'delivered': return 'success' // Assuming you have a 'success' variant for Badge
      case 'cancelled': return 'outline'
      default: return 'outline'
    }
  }

  const statusTranslations: Record<OrderStatus, string> = {
    pending: t('order.status.pending') || 'Pending',
    processing: t('order.status.processing') || 'Processing',
    shipped: t('order.status.shipped') || 'Shipped',
    delivered: t('order.status.delivered') || 'Delivered',
    cancelled: t('order.status.cancelled') || 'Cancelled',
  }

  if (isLoading) {
    return <p>{t('messages.loading') || 'Loading orders...'}</p>
  }

  if (error) {
    return <p className="text-destructive">{t('messages.error')}: {error}</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('seller.orderManagement') || 'Order Management'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('order.id') || 'Order ID'}</TableHead>
              <TableHead>{t('order.customer') || 'Customer'}</TableHead>
              <TableHead>{t('order.date') || 'Date'}</TableHead>
              <TableHead className="text-right">{t('order.total') || 'Total'}</TableHead>
              <TableHead className="text-center">{t('order.status') || 'Status'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">{t('messages.noOrders') || 'No orders found.'}</TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{`$${order.total.toFixed(2)}`}</TableCell>
                  <TableCell className="text-center">
                    <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}>
                      <SelectTrigger className="w-32 mx-auto">
                        <SelectValue asChild>
                          <Badge variant={getStatusVariant(order.status)}>{statusTranslations[order.status]}</Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statusTranslations).map((status) => (
                           <SelectItem key={status} value={status}>{statusTranslations[status as OrderStatus]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
