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
  totalSales?: number;
  totalProducts?: number;
  joinDate?: string;
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
        // Enhance seller data with mock sales information for demonstration
        const enhancedSellers = sellerList.map((seller: Seller) => ({
          ...seller,
          totalSales: Math.floor(Math.random() * 10000), // Mock data
          totalProducts: Math.floor(Math.random() * 50), // Mock data
          joinDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] // Mock date
        }));
        setSellers(enhancedSellers);
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

      await response.json();
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.name')}</TableHead>
              <TableHead>{t('admin.email')}</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead>{t('admin.totalSales')}</TableHead>
              <TableHead>{t('admin.totalProducts')}</TableHead>
              <TableHead>{t('admin.joinDate')}</TableHead>
              <TableHead>{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellers.map(seller => (
              <TableRow key={seller.id}>
                <TableCell className="font-medium">{seller.name}</TableCell>
                <TableCell>{seller.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    seller.status === 'approved' ? 'bg-green-100 text-green-800' :
                    seller.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t(`admin.${seller.status}`)}
                  </span>
                </TableCell>
                <TableCell>{seller.totalSales?.toLocaleString()} {t('common.currency')}</TableCell>
                <TableCell>{seller.totalProducts}</TableCell>
                <TableCell>{seller.joinDate}</TableCell>
                <TableCell>
                  {seller.status === 'pending' && (
                    <>
                      <Button onClick={() => handleApproval(seller.id, 'approved')} className="mr-2" size="sm">
                        {t('admin.approve')}
                      </Button>
                      <Button onClick={() => handleApproval(seller.id, 'rejected')} variant="destructive" size="sm">
                        {t('admin.reject')}
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};