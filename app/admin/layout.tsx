'use client'

import { useAuth } from '@/lib/auth-context';
import { useLocale } from '@/lib/locale-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  BookOpen,
  BarChart3,
  FileText
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('admin.menu')}</h2>
        </div>
        <nav className="mt-2 px-4 space-y-1">
          <Link href="/admin/dashboard" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5 me-3" />
            {t('admin.dashboard')}
          </Link>

          <Link href="/admin/dashboard/users" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Users className="w-5 h-5 me-3" />
            {t('admin.users')}
          </Link>

          <Link href="/admin/dashboard/sellers" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Store className="w-5 h-5 me-3" />
            {t('admin.sellers')}
          </Link>

          <Link href="/admin/dashboard/products" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Package className="w-5 h-5 me-3" />
            {t('admin.products')}
          </Link>

          <Link href="/admin/dashboard/orders" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5 me-3" />
            {t('admin.orders')}
          </Link>

          <Link href="/admin/dashboard/stories" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <BookOpen className="w-5 h-5 me-3" />
            {t('admin.stories.title')}
          </Link>

          <Link href="/admin/dashboard/stats" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <BarChart3 className="w-5 h-5 me-3" />
            {t('admin.statistics')}
          </Link>

          <Link href="/admin/dashboard/reports" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <FileText className="w-5 h-5 me-3" />
            {t('admin.reports')}
          </Link>
        </nav>
      </aside>
      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold">{t('admin.dashboard')}</h1>
          <Button onClick={logout}>{t('header.logout')}</Button>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
