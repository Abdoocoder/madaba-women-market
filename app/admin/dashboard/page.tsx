'use client'

import { useLocale } from '@/lib/locale-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const dashboardSections = [
  { href: '/admin/dashboard/users', title: 'Users', description: 'Manage all user accounts.' },
  { href: '/admin/dashboard/sellers', title: 'Sellers', description: 'Manage seller accounts and approvals.' },
  { href: '/admin/dashboard/products', title: 'Products', description: 'Manage all products.' },
  { href: '/admin/dashboard/orders', title: 'Orders', description: 'Manage all orders.' },
  { href: '/admin/dashboard/stats', title: 'Statistics', description: 'View summary statistics.' },
];

const AdminDashboard = () => {
  const { t } = useLocale();

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardSections.map((section) => (
          <Link key={section.href} href={section.href} passHref>
            <Button as="a" className="w-full h-full text-left flex flex-col items-start p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <h2 className="text-xl font-bold">{t(section.title.toLowerCase())}</h2>
              <p>{t(section.description.toLowerCase())}</p>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
