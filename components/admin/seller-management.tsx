"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Seller {
    id: string;
    name: string;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
}

export function SellerManagement() {
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSellers = async () => {
            setIsLoading(true);
            try {
                const q = query(collection(db, "users"), where("role", "==", "seller"));
                const querySnapshot = await getDocs(q);
                const sellersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seller));
                setSellers(sellersData);
            } catch (error) {
                console.error("Error fetching sellers: ", error);
                toast({ title: "Error", description: "Failed to fetch sellers.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSellers();
    }, [toast]);

    const handleStatusUpdate = async (sellerId: string, status: 'approved' | 'rejected') => {
        try {
            const sellerDocRef = doc(db, "users", sellerId);
            await updateDoc(sellerDocRef, { status });
            setSellers(sellers.map(seller => seller.id === sellerId ? { ...seller, status } : seller));
            toast({ title: "Success", description: `Seller has been ${status}.`, variant: "success" });
        } catch (error) {
            console.error(`Error updating seller status: `, error);
            toast({ title: "Error", description: "Failed to update seller status.", variant: "destructive" });
        }
    };

    if (isLoading) {
        return <div>Loading sellers...</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sellers.map((seller) => (
                    <TableRow key={seller.id}>
                        <TableCell>{seller.name}</TableCell>
                        <TableCell>{seller.email}</TableCell>
                        <TableCell>
                            <Badge variant={seller.status === 'approved' ? 'success' : seller.status === 'pending' ? 'secondary' : 'destructive'}>
                                {seller.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {seller.status === 'pending' && (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleStatusUpdate(seller.id, 'approved')}>Approve</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(seller.id, 'rejected')}>Reject</Button>
                                </div>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
