
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { useToast } from "@/components/ui/use-toast";

export default function WishlistPage() {
    const { user, isLoading } = useAuth();
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loadingWishlist, setLoadingWishlist] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!user) {
                setLoadingWishlist(false);
                return;
            }

            setLoadingWishlist(true);
            try {
                const wishlistRef = doc(db, "wishlists", user.id);
                const wishlistSnap = await getDoc(wishlistRef);

                if (wishlistSnap.exists()) {
                    const productIds = wishlistSnap.data().products as string[];
                    const productPromises = productIds.map(id => getDoc(doc(db, "products", id)));
                    const productDocs = await Promise.all(productPromises);
                    const wishlistProducts = productDocs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                    setWishlist(wishlistProducts);
                }
            } catch (error) {
                console.error("Error fetching wishlist: ", error);
                toast({ title: "Error", description: "Failed to fetch your wishlist.", variant: "destructive" });
            } finally {
                setLoadingWishlist(false);
            }
        };

        if (!isLoading) {
            fetchWishlist();
        }
    }, [user, isLoading, toast]);

    const handleRemoveFromWishlist = async (productId: string) => {
        if (!user) return;

        try {
            const wishlistRef = doc(db, "wishlists", user.id);
            await updateDoc(wishlistRef, {
                products: wishlist.filter(p => p.id !== productId).map(p => p.id)
            });
            setWishlist(wishlist.filter(p => p.id !== productId));
            toast({ title: "Success", description: "Product removed from wishlist.", variant: "success" });
        } catch (error) {
            console.error("Error removing from wishlist: ", error);
            toast({ title: "Error", description: "Failed to remove product from wishlist.", variant: "destructive" });
        }
    };


    if (isLoading || loadingWishlist) {
        return <div className="container mx-auto px-4 py-8 text-center">Loading your wishlist...</div>;
    }

    if (!user) {
        return <div className="container mx-auto px-4 py-8 text-center">Please log in to see your wishlist.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
            {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlist.map(product => (
                        <ProductCard key={product.id} product={product} onRemoveFromWishlist={handleRemoveFromWishlist} />
                    ))
                    }
                </div>
            ) : (
                <p className="text-center text-gray-500">Your wishlist is empty.</p>
            )}
        </div>
    );
}
