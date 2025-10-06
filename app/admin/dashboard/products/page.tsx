'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { useLocale } from '@/lib/locale-context';
import { Product } from '@/lib/types';

import ProductManagementPageClient from './page-client';

export default function ProductManagementPage() {
  return <ProductManagementPageClient />;
}
