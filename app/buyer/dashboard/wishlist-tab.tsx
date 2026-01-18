"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/products/product-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useLocale } from "@/lib/locale-context";
import { useCart } from "@/lib/cart-context";

export function WishlistTab() {
  const { user } = useAuth();
  const { t } = useLocale();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
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
        toast({
          title: t('messages.error'),
          description: t('messages.failedToFetchWishlist'),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWishlist();
    }
  }, [user, t, toast]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const updatedWishlistIds = wishlist.filter(p => p.id !== productId).map(p => p.id);

      const { error } = await supabase
        .from("profiles")
        .update({ wishlist: updatedWishlistIds })
        .eq("id", user.id);

      if (error) throw error;

      setWishlist(wishlist.filter(p => p.id !== productId));
      toast({
        title: t('messages.success'),
        description: t('messages.productRemovedFromWishlist')
      });
    } catch (error) {
      console.error("Error removing from wishlist: ", error);
      toast({
        title: t('messages.error'),
        description: t('messages.failedToRemoveFromWishlist'),
        variant: "destructive"
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: t('messages.success'),
      description: t('messages.productAddedToCart')
    });
  };
  // ... rest of the file ...

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('common.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('buyer.wishlist')}</CardTitle>
        <CardDescription>{t('buyer.wishlistDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map(product => (
              <div key={product.id} className="relative">
                <ProductCard product={product} onRemoveFromWishlist={handleRemoveFromWishlist} />
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddToCart(product)}
                  >
                    {t('cart.addToCart')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('wishlist.empty')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
