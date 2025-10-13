'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ReportData {
  users: number;
  sellers: number;
  products: number;
  orders: number;
  totalSales: number;
  pendingSellers: number;
  approvedSellers: number;
  rejectedSellers: number;
  pendingProducts: number;
  approvedProducts: number;
  suspendedProducts: number;
  recentOrders: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
  }>;
  topSellers: Array<{
    id: string;
    name: string;
    sales: number;
    products: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ReportsClient() {
  const { user, isLoading, getAuthToken } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        // For now, we'll use the existing stats API and mock additional data
        const statsResponse = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!statsResponse.ok) {
          throw new Error(`Failed to fetch stats: ${statsResponse.status} ${statsResponse.statusText}`);
        }

        const statsData = await statsResponse.json();
        
        // Mock additional data for demonstration
        const mockData: ReportData = {
          ...statsData,
          totalSales: 12500,
          pendingSellers: 3,
          approvedSellers: statsData.sellers - 3,
          rejectedSellers: 2,
          pendingProducts: 5,
          approvedProducts: statsData.products - 5,
          suspendedProducts: 2,
          recentOrders: [
            { id: '1', date: '2023-10-15', amount: 150, status: 'delivered' },
            { id: '2', date: '2023-10-14', amount: 89, status: 'processing' },
            { id: '3', date: '2023-10-14', amount: 210, status: 'shipped' },
            { id: '4', date: '2023-10-13', amount: 65, status: 'delivered' },
            { id: '5', date: '2023-10-12', amount: 199, status: 'delivered' },
          ],
          topSellers: [
            { id: '1', name: 'سما الزيود', sales: 1200, products: 15 },
            { id: '2', name: 'نورا خالد', sales: 980, products: 12 },
            { id: '3', name: 'فاطمة عبد الله', sales: 750, products: 8 },
            { id: '4', name: 'عائشة محمد', sales: 620, products: 10 },
            { id: '5', name: 'سارة عبدالله', sales: 540, products: 7 },
          ]
        };

        setReportData(mockData);
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchReportData();
    }
  }, [user, getAuthToken]);

  if (isLoading || user?.role !== 'admin') {
    return <div>{t('admin.loading')}</div>;
  }

  if (loading) {
    return <div className="container mx-auto py-10">{t('admin.loading')}</div>;
  }

  if (!reportData) {
    return <div className="container mx-auto py-10">{t('admin.failedToLoadData')}</div>;
  }

  // Prepare data for charts
  const sellerStatusData = [
    { name: t('admin.pending'), value: reportData.pendingSellers },
    { name: t('admin.approved'), value: reportData.approvedSellers },
    { name: t('admin.rejected'), value: reportData.rejectedSellers },
  ];

  const productStatusData = [
    { name: t('admin.pending'), value: reportData.pendingProducts },
    { name: t('admin.approved'), value: reportData.approvedProducts },
    { name: t('admin.suspended'), value: reportData.suspendedProducts },
  ];

  const topSellersData = reportData.topSellers.map(seller => ({
    name: seller.name,
    sales: seller.sales
  }));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t('admin.reports')}</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalSales')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalSales} {t('common.currency')}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalUsers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.users}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalSellers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.sellers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalOrders')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.orders}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Seller Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.sellerStatusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sellerStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent as number * 100).toFixed(0)}%`}
                >
                  {sellerStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Product Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.productStatusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent as number * 100).toFixed(0)}%`}
                >
                  {productStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Sellers Chart */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.topSellers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topSellersData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name={t('admin.sales')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Orders Table */}
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.recentOrders')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('admin.orderId')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('admin.date')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('admin.amount')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('admin.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.amount} {t('common.currency')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {t(`orders.statuses.${order.status}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
