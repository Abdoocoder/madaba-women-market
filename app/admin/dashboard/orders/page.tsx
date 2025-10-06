'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';
import { useLocale } from '@/lib/locale-context';
import { Order } from '@/lib/types';

const OrderManagementPage = () => {
  const { user, isLoading, getAuthToken } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const { t } = useLocale();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        const response = await fetch('/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
        }

        const orderList = await response.json();
        setOrders(orderList);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error(t('messages.failedToFetchOrders'));
      }
    };

    if (user?.role === 'admin') {
      fetchOrders();
    }
  }, [user, getAuthToken, t]);

  const handleStatusChange = async (orderId: string, status: 'pending' | 'processing' | 'shipped' | 'delivered') => {
    const toastId = toast.loading(t('order.updatingStatus'));
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success(t('order.statusUpdated'), { id: toastId });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(t('order.statusUpdateFailed'), { id: toastId });
    }
  };

  if (isLoading || user?.role !== 'admin') {
    return <div>{t('admin.loading')}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t('admin.manageOrders')}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('order.id')}</TableHead>
            <TableHead>{t('order.customer')}</TableHead>
            <TableHead>{t('order.total')}</TableHead>
            <TableHead>{t('order.status')}</TableHead>
            <TableHead>{t('order.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(o => (
            <TableRow key={o.id}>
              <TableCell>{o.id}</TableCell>
              <TableCell>{o.customerId}</TableCell>
              <TableCell>{o.total}</TableCell>
              <TableCell>
                <Select value={o.status} onValueChange={(value) => handleStatusChange(o.id, value as any)}>
                  <SelectTrigger>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderManagementPage;