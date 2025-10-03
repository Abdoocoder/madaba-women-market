'use client'

import { useAuth } from '@/lib/auth-context';
import { useLocale } from '@/lib/locale-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== 'admin') {
    return <div>{t('admin.loading')}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard')}</h1>
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
    </div>
  );
};

export default AdminDashboard;
