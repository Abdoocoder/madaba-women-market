'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';

const StatsPage = () => {
  const { user, isLoading, getAuthToken } = useAuth();
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
      try {
        const token = await getAuthToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user, getAuthToken]);

  if (isLoading || user?.role !== 'admin') {
    return <div>{t('admin.loading')}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t('admin.statistics')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold">{t('admin.totalUsers')}</h2>
          <p className="text-3xl">{stats.users}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold">{t('admin.totalSellers')}</h2>
          <p className="text-3xl">{stats.sellers}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold">{t('admin.totalProducts')}</h2>
          <p className="text-3xl">{stats.products}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold">{t('admin.totalOrders')}</h2>
          <p className="text-3xl">{stats.orders}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
