"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
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
        const wishlistRef = doc(db, "wishlists", user.id);
        const wishlistSnap = await getDoc(wishlistRef);

        if (wishlistSnap.exists()) {
          const productIds = wishlistSnap.data().products as string[];
          const productPromises = productIds.map(id => getDoc(doc(db, "products", id)));
          const productDocs = await Promise.all(productPromises);
          const wishlistProducts = productDocs
            .filter(doc => doc.exists())
            .map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setWishlist(wishlistProducts);
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
      const wishlistRef = doc(db, "wishlists", user.id);
      const updatedWishlist = wishlist.filter(p => p.id !== productId).map(p => p.id);
      await updateDoc(wishlistRef, {
        products: updatedWishlist
      });
      setWishlist(wishlist.filter(p => p.id !== productId));
      toast({ 
        title: t('messages.success'), 
        description: t('messages.productRemovedFromWishlist'), 
        variant: "success" 
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
      description: t('messages.productAddedToCart'), 
      variant: "success" 
    });
  };

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
        <CardTitle>{t('dashboard.wishlist')}</CardTitle>
        <CardDescription>{t('dashboard.wishlistDescription')}</CardDescription>
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