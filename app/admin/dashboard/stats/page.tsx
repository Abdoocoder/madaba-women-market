'use client'

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';

const StatsPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  const [stats, setStats] = useState({
    users: 0,
    sellers: 0,
    products: 0,
    orders: 0,
  });

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const ordersSnapshot = await getDocs(collection(db, 'orders'));

      const sellers = usersSnapshot.docs.filter(doc => doc.data().role === 'seller').length;

      setStats({
        users: usersSnapshot.size,
        sellers,
        products: productsSnapshot.size,
        orders: ordersSnapshot.size,
      });
    };

    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  if (isLoading || user?.role !== 'admin') {
    return <div>{t('admin.loading')}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold">Total Users</h2>
          <p className="text-3xl">{stats.users}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold">Total Sellers</h2>
          <p className="text-3xl">{stats.sellers}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold">Total Products</h2>
          <p className="text-3xl">{stats.products}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold">Total Orders</h2>
          <p className="text-3xl">{stats.orders}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
