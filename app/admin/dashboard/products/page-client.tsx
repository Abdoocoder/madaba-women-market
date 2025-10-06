'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { ProductManagement } from '@/components/admin/product-management';
import toast from 'react-hot-toast';
import { useLocale } from '@/lib/locale-context';
import { Product } from '@/lib/types';

const ProductManagementPageClient = () => {
  const { user, isLoading, getAuthToken } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const { t } = useLocale();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchProducts = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const productList = await response.json();
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products.');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts();
    }
  }, [user, getAuthToken]);

  if (isLoading || user?.role !== 'admin') {
    return <div>{t('admin.loading')}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Product Management</h1>
      <ProductManagement products={products} onProductsUpdate={fetchProducts} />
    </div>
  );
};

export default ProductManagementPageClient;