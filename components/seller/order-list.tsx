"use client"

import { useState, useEffect } from 'react'
import { useLocale } from '@/lib/locale-context'
import { useAuth } from '@/lib/auth-context'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Order as OrderType } from '@/lib/types'

interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: OrderStatus;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

// Create auth headers for API requests
const createAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
})

export function OrderList() {
  const { t } = useLocale()
  const { getAuthToken } = useAuth() // Get the token function
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getAuthToken()
        if (!token) {
          console.error('No auth token available for orders')
          setError('Authentication required')
          return
        }

        console.log('Fetching orders with token:', token.substring(0, 20) + '...')
        const response = await fetch('/api/orders', {
          method: 'GET',
          headers: createAuthHeaders(token),
        })

        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        } else {
          console.error('Orders API error:', response.status, response.statusText)
          setError(t('messages.failedToFetchOrders') || 'Failed to fetch orders')
        }
      } catch (err) {
        setError(t('messages.networkError') || 'Network error')
        console.error('Error fetching orders:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [getAuthToken, t]) // Re-run effect if getAuthToken changes

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    const token = await getAuthToken()
    if (!token) return; 

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
      } else {
        setError(t('messages.failedToUpdateOrder') || 'Failed to update order')
      }
    } catch (err) {
      setError(t('messages.networkError') || 'Network error')
      console.error('Error updating order:', err)
    }
  }

  // Status translations
  const statusTranslations: Record<OrderStatus, string> = {
    pending: t('order.pending'),
    processing: t('order.processing'), 
    shipped: t('order.shipped'),
    delivered: t('order.delivered')
  }

  // Status badge variants
  const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'processing':
        return 'default'
      case 'shipped':
        return 'outline'
      case 'delivered':
        return 'default'
      default:
        return 'secondary'
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">{t('common.loading')}</div>
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('order.id')}</TableHead>
            <TableHead>{t('order.customer')}</TableHead>
            <TableHead>{t('order.date')}</TableHead>
            <TableHead>{t('order.total')}</TableHead>
            <TableHead>{t('order.status')}</TableHead>
            <TableHead>{t('order.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <td colSpan={6} className="text-center p-4">
                {t('messages.noOrders')}
              </td>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>{statusTranslations[order.status]}</Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(value: OrderStatus) => handleStatusUpdate(order.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('order.pending')}</SelectItem>
                      <SelectItem value="processing">{t('order.processing')}</SelectItem>
                      <SelectItem value="shipped">{t('order.shipped')}</SelectItem>
                      <SelectItem value="delivered">{t('order.delivered')}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
