"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/locale-context";
import toast from "react-hot-toast";

interface Seller {
    id: string;
    name: string;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
    role?: string;
}

export function SellerManagement() {
    const { getAuthToken } = useAuth();
    const { t } = useLocale();
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast: toastFn } = useToast();

    useEffect(() => {
        const fetchSellers = async () => {
            setIsLoading(true);
            try {
                const token = await getAuthToken();
                if (!token) {
                    throw new Error('No authentication token available');
                }

                const response = await fetch('/api/admin/sellers', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch sellers: ${response.status} ${response.statusText}`);
                }

                const sellersData = await response.json();
                setSellers(sellersData);
            } catch (error) {
                console.error("Error fetching sellers: ", error);
                toastFn({ title: "Error", description: "Failed to fetch sellers.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSellers();
    }, [getAuthToken, toastFn]);

    const handleStatusUpdate = async (sellerId: string, status: 'approved' | 'rejected') => {
        try {
            const token = await getAuthToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch('/api/admin/sellers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sellerId, status }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update seller status: ${response.status} ${response.statusText}`);
            }

            setSellers(sellers.map(seller => seller.id === sellerId ? { ...seller, status } : seller));
            toast.success(t("admin.statusUpdated"));
        } catch (error) {
            console.error(`Error updating seller status: `, error);
            toast.error(t("admin.statusUpdateFailed"));
        }
    };

    if (isLoading) {
        return <div>{t("common.loading")}</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t("admin.name")}</TableHead>
                    <TableHead>{t("admin.email")}</TableHead>
                    <TableHead>{t("admin.status")}</TableHead>
                    <TableHead>{t("admin.actions")}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sellers.map((seller) => (
                    <TableRow key={seller.id}>
                        <TableCell>{seller.name}</TableCell>
                        <TableCell>{seller.email}</TableCell>
                        <TableCell>
                            <Badge variant={seller.status === 'approved' ? 'default' : seller.status === 'pending' ? 'secondary' : 'destructive'}>
                                {t(`admin.${seller.status}`)}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {seller.status === 'pending' && (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleStatusUpdate(seller.id, 'approved')}>{t("admin.approve")}</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(seller.id, 'rejected')}>{t("admin.reject")}</Button>
                                </div>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}