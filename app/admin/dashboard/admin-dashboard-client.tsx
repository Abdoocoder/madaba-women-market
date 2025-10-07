'use client'

import { useLocale } from '@/lib/locale-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const dashboardSections = [
  { href: '/admin/dashboard/users', title: 'admin.users', description: 'admin.manageUsers' },
  { href: '/admin/dashboard/sellers', title: 'admin.sellers', description: 'admin.manageSellers' },
  { href: '/admin/dashboard/products', title: 'admin.products', description: 'admin.manageProducts' },
  { href: '/admin/dashboard/orders', title: 'admin.orders', description: 'admin.manageOrders' },
  { href: '/admin/dashboard/stories', title: 'admin.stories.title', description: 'admin.stories.description' },
  { href: '/admin/dashboard/stats', title: 'admin.statistics', description: 'admin.viewStatistics' },
  { href: '/admin/dashboard/reports', title: 'admin.reports', description: 'admin.detailedReports' },
];

export default function AdminDashboardClient() {
  const { t } = useLocale();

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardSections.map((section) => (
          <Link key={section.href} href={section.href} passHref>
            <Button asChild className="w-full h-full text-left flex flex-col items-start p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <div>
                <h2 className="text-xl font-bold">{t(section.title)}</h2>
                <p>{t(section.description)}</p>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};
