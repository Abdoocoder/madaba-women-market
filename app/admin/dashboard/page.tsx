'use client'

import { useAuth } from '@/lib/auth-context';
import { useLocale } from '@/lib/locale-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
import { useEffect } from 'react';
=======
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
>>>>>>> 039bd9a1e970403f673994e6abeee3bea9fe5827

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
<<<<<<< HEAD
=======
  const [sellers, setSellers] = useState<Seller[]>([]);
>>>>>>> 039bd9a1e970403f673994e6abeee3bea9fe5827
  const { t } = useLocale();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

<<<<<<< HEAD
  if (isLoading || user?.role !== 'admin') {
    return <div>{t('admin.loading')}</div>;
=======
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
>>>>>>> 039bd9a1e970403f673994e6abeee3bea9fe5827
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard')}</h1>
<<<<<<< HEAD
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/dashboard/users">
          <a className="p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <h2 className="text-xl font-bold">Users</h2>
            <p>Manage all user accounts.</p>
          </a>
        </Link>
        <Link href="/admin/dashboard/sellers">
          <a className="p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <h2 className="text-xl font-bold">Sellers</h2>
            <p>Manage seller accounts and approvals.</p>
          </a>
        </Link>
        <Link href="/admin/dashboard/products">
          <a className="p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <h2 className="text-xl font-bold">Products</h2>
            <p>Manage all products.</p>
          </a>
        </Link>
        <Link href="/admin/dashboard/orders">
          <a className="p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <h2 className="text-xl font-bold">Orders</h2>
            <p>Manage all orders.</p>
          </a>
        </Link>
        <Link href="/admin/dashboard/stats">
          <a className="p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <h2 className="text-xl font-bold">Statistics</h2>
            <p>View summary statistics.</p>
          </a>
        </Link>
      </div>
=======
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
>>>>>>> 039bd9a1e970403f673994e6abeee3bea9fe5827
    </div>
  );
};

export default AdminDashboard;
