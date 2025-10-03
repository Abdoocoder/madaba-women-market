'use client'

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
}

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
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
      const querySnapshot = await getDocs(collection(db, 'users'));
      const sellerList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Seller))
        .filter(seller => seller.role === 'seller');
      setSellers(sellerList);
    };

    if (user?.role === 'admin') {
      fetchSellers();
    }
  }, [user]);

  const handleApproval = async (sellerId: string, status: 'approved' | 'rejected') => {
    const toastId = toast.loading(t('admin.updatingStatus'));
    try {
      const sellerRef = doc(db, 'users', sellerId);
      await updateDoc(sellerRef, { status });
      setSellers(sellers.map(seller => seller.id === sellerId ? { ...seller, status } : seller));
      toast.success(t('admin.statusUpdated'), { id: toastId });
    } catch (error) {
      console.error('Error updating seller status:', error);
      toast.error(t('admin.statusUpdateFailed'), { id: toastId });
    }
  };

  if (isLoading || user?.role !== 'admin') {
    return <div>{t('admin.loading')}</div>; // Or a proper loading spinner
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard')}</h1>
      <h2 className="text-2xl font-bold mb-4">{t('admin.sellerManagement')}</h2>
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

export default AdminDashboard;
