'''use client'''

import { useAuth } from '@/lib/auth-context';
import { useLocale } from '@/lib/locale-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

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
    <div>
      <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 border-b">
        <h1 className="text-2xl font-bold">{t('admin.dashboard')}</h1>
        <Button onClick={logout}>{t('admin.logout')}</Button>
      </header>
      <main>{children}</main>
    </div>
  );
}
