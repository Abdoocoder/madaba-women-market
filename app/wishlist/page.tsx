"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/products/product-card";
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
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("wishlist")
                    .eq("id", user.id)
                    .single();

                if (profileError) throw profileError;

                const productIds = profile.wishlist as string[] || [];

                if (productIds.length > 0) {
                    const { data: products, error: productsError } = await supabase
                        .from("products")
                        .select("*")
                        .in("id", productIds);

                    if (productsError) throw productsError;

                    const wishlistProducts: Product[] = products.map((p) => ({
                        id: p.id,
                        name: p.name,
                        nameAr: p.name_ar,
                        description: p.description,
                        descriptionAr: p.description_ar,
                        price: p.price,
                        category: p.category,
                        image: p.image_url,
                        sellerId: p.seller_id,
                        sellerName: p.seller_name,
                        stock: p.stock,
                        featured: p.featured,
                        approved: p.approved,
                        suspended: p.suspended,
                        purchaseCount: p.purchase_count,
                        createdAt: new Date(p.created_at)
                    }));
                    setWishlist(wishlistProducts);
                } else {
                    setWishlist([]);
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
            const newWishlistIds = wishlist.filter(p => p.id !== productId).map(p => p.id);

            const { error } = await supabase
                .from("profiles")
                .update({ wishlist: newWishlistIds })
                .eq("id", user.id);

            if (error) throw error;

            setWishlist(wishlist.filter(p => p.id !== productId));
            toast({ title: "Success", description: "Product removed from wishlist." });
        } catch (error) {
            console.error("Error removing from wishlist: ", error);
            toast({ title: "Error", description: "Failed to remove product from wishlist.", variant: "destructive" });
        }
    };
    // ... rest of the file ...


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
