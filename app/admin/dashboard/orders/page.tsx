'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Order } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setOrders(data.map(order => ({
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
          items: []
        })))
      }
    }

    fetchOrders()

    const channel = supabase
      .channel('orders_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `seller_id=eq.${user.id}`
      }, (payload) => {
        fetchOrders() // Simple refresh on change
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      toast({ title: "Success", description: "Order status updated successfully." })
    } catch (error) {
      console.error("Error updating order status: ", error)
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" })
    }
  }
  // ... rest of the file ...

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground">{order.shippingAddress}</div>
                  <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                </TableCell>
                <TableCell>{format(new Date(order.createdAt), 'PPP')}</TableCell>
                <TableCell>
                  <Select value={order.status} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">{order.totalPrice}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
