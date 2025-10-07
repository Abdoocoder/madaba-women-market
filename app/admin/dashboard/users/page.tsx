'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';
import { useLocale } from '@/lib/locale-context';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
}

const UserManagementPage = () => {
  const { user, isLoading, getAuthToken } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const { t } = useLocale();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }

        const userList = await response.json();
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error(t('messages.failedToFetchUsers'));
      }
    };

    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user, getAuthToken, t]);

  const handleRoleChange = async (userId: string, role: 'customer' | 'seller' | 'admin') => {
    const toastId = toast.loading(t('admin.updatingUserRole'));
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.status} ${response.statusText}`);
      }

      await response.json();
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      toast.success(t('admin.userRoleUpdated'), { id: toastId });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(t('admin.userRoleUpdateFailed'), { id: toastId });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const toastId = toast.loading(t('admin.deletingUser'));
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`);
      }

      await response.json();
      setUsers(users.filter(u => u.id !== userId));
      toast.success(t('admin.userDeleted'), { id: toastId });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('admin.userDeleteFailed'), { id: toastId });
    }
  };

  if (isLoading || user?.role !== 'admin') {
    return <div>{t('admin.loading')}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t('admin.manageUsers')}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admin.name')}</TableHead>
            <TableHead>{t('admin.email')}</TableHead>
            <TableHead>{t('admin.role')}</TableHead>
            <TableHead>{t('admin.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Select value={u.role} onValueChange={(value) => handleRoleChange(u.id, value as 'customer' | 'seller' | 'admin')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">{t('admin.customer')}</SelectItem>
                    <SelectItem value="seller">{t('admin.seller')}</SelectItem>
                    <SelectItem value="admin">{t('admin.admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleDeleteUser(u.id)} variant="destructive">{t('common.delete')}</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagementPage;
