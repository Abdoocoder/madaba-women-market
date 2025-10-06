'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { useLocale } from '@/lib/locale-context';

interface Seller {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  role?: string;
}

export default function SellerManagementClient() {
  const { user, isLoading, getAuthToken } = useAuth();
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const { t } = useLocale();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        const response = await fetch('/api/admin/sellers', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch sellers: ${response.status} ${response.statusText}`);
        }

        const sellerList = await response.json();
        setSellers(sellerList);
      } catch (error) {
        console.error('Error fetching sellers:', error);
        toast.error(t('messages.failedToFetchSellers') || 'Failed to fetch sellers.');
      }
    };

    if (user?.role === 'admin') {
      fetchSellers();
    }
  }, [user, getAuthToken, t]);

  const handleApproval = async (sellerId: string, status: 'approved' | 'rejected') => {
    const toastId = toast.loading(t('admin.updatingStatus'));
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/admin/sellers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sellerId, status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update seller status: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setSellers(sellers.map(seller => seller.id === sellerId ? { ...seller, status } : seller));
      toast.success(t('admin.statusUpdated'), { id: toastId });
    } catch (error) {
      console.error('Error updating seller status:', error);
      toast.error(t('admin.statusUpdateFailed'), { id: toastId });
    }
  };

  if (isLoading || user?.role !== 'admin') {
    return <div>{t('admin.loading')}</div>; 
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t('admin.sellerManagement')}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admin.name')}</TableHead>
            <TableHead>{t('admin.email')}</TableHead>
            <TableHead>{t('admin.status')}</TableHead>
            <TableHead>{t('admin.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellers.map(seller => (
            <TableRow key={seller.id}>
              <TableCell>{seller.name}</TableCell>
              <TableCell>{seller.email}</TableCell>
              <TableCell>{seller.status}</TableCell>
              <TableCell>
                {seller.status === 'pending' && (
                  <>
                    <Button onClick={() => handleApproval(seller.id, 'approved')} className="mr-2">{t('admin.approve')}</Button>
                    <Button onClick={() => handleApproval(seller.id, 'rejected')} variant="destructive">{t('admin.reject')}</Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
