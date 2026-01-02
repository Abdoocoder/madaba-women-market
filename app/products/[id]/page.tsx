"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Star, MessageSquare, ShoppingCart, Heart, Send, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MOCK_REVIEWS } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/locale-context";
import { formatCurrency } from "@/lib/utils";
import type { Product, Review } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function ProductDetailPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [wishlisted, setWishlisted] = useState(false);
    const [newReview, setNewReview] = useState("");
    const [newRating, setNewRating] = useState(5);

    const { id } = useParams();
    const { addToCart } = useCart();
    const { user, isLoading: isAuthLoading } = useAuth();
    const { t, language } = useLocale();
    const { toast } = useToast();

    useEffect(() => {
        const fetchProductAndWishlist = async () => {
            try {
                // Fetch product from Supabase directly for consistency
                const { data: p, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("id", id)
                    .single()

                if (error || !p) {
                    notFound();
                    return;
                }

                const fetchedProduct: Product = {
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
                };
                setProduct(fetchedProduct);

                // Fetch reviews (mapping snake_case to Review interface)
                const { data: reviewsData, error: reviewsError } = await supabase
                    .from("reviews")
                    .select("*")
                    .eq("product_id", id)
                    .order("created_at", { ascending: false })

                if (reviewsData) {
                    setReviews(reviewsData.map(r => ({
                        id: r.id,
                        productId: r.product_id,
                        userId: r.user_id,
                        userName: r.user_name,
                        rating: r.rating,
                        comment: r.comment,
                        createdAt: new Date(r.created_at)
                    })));
                }

                if (user) {
                    const { data: wishlistData, error: wishlistError } = await supabase
                        .from("profiles")
                        .select("wishlist")
                        .eq("id", user.id)
                        .single();

                    if (wishlistData && wishlistData.wishlist && Array.isArray(wishlistData.wishlist)) {
                        if (wishlistData.wishlist.includes(id as string)) {
                            setWishlisted(true);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                notFound();
            }
        };

        if (id && !isAuthLoading) {
            fetchProductAndWishlist();
        }
    }, [id, user, isAuthLoading]);

    if (!product) {
        return null; // Or a loading spinner
    }

    const handleAddToCart = () => {
        addToCart(product);
    };

    const handleWishlist = async () => {
        if (!user) {
            toast({ title: t("product.loginRequired"), description: t("product.loginRequiredDescription"), variant: "destructive" });
            return;
        }

        try {
            // Get current wishlist
            const { data: profile, error: fetchError } = await supabase
                .from("profiles")
                .select("wishlist")
                .eq("id", user.id)
                .single();

            if (fetchError) throw fetchError;

            let currentWishlist = profile.wishlist || [];
            let newWishlist;

            if (wishlisted) {
                newWishlist = currentWishlist.filter((pid: string) => pid !== product.id);
                toast({ title: t("product.removed"), description: t("product.removedFromWishlist") });
            } else {
                newWishlist = [...currentWishlist, product.id];
                toast({ title: t("product.added"), description: t("product.addedToWishlist") });
            }

            const { error: updateError } = await supabase
                .from("profiles")
                .update({ wishlist: newWishlist })
                .eq("id", user.id);

            if (updateError) throw updateError;

            setWishlisted(!wishlisted);
        } catch (error) {
            console.error("Error updating wishlist: ", error);
            toast({ title: t("product.error"), description: t("product.failedToUpdateWishlist"), variant: "destructive" });
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newReview) return;

        try {
            const { data, error } = await supabase
                .from("reviews")
                .insert({
                    product_id: product.id,
                    user_id: user.id,
                    user_name: user.name,
                    rating: newRating,
                    comment: newReview
                })
                .select()
                .single()

            if (error) throw error

            const review: Review = {
                id: data.id,
                productId: data.product_id,
                userId: data.user_id,
                userName: data.user_name,
                rating: data.rating,
                comment: data.comment,
                createdAt: new Date(data.created_at),
            };
            setReviews([review, ...reviews]);
            setNewReview("");
            setNewRating(5);
            toast({ title: t("common.success"), description: t("product.reviewSubmitted") });
        } catch (error) {
            console.error("Error submitting review:", error);
            toast({ title: t("common.error"), description: t("product.failedToSubmitReview"), variant: "destructive" });
        }
    };
    const handleContactSeller = () => {
        if (!user) {
            toast({
                title: t("product.loginRequired"),
                description: t("product.loginToContactSeller"),
                variant: "destructive"
            });
            return;
        }

        // In a real app, this would open a chat or redirect to a messaging page
        toast({
            title: t("product.contactSeller"),
            description: t("product.chatFeatureComingSoon")
        });
    };

    const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
    const purchaseCount = product.purchaseCount || 0;

    return (
        <div className="min-h-screen bg-background">
            <main className="container py-8">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    <div>
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                            <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.nameAr}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                            />
                            {product.featured && (
                                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600">
                                    {t("product.featured")}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-balance">
                            {language === "ar" ? product.nameAr : product.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-muted-foreground">({reviews.length} {t("product.reviews")})</span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <TrendingUp className="w-4 h-4" />
                                <span>{purchaseCount} {t("product.purchases")}</span>
                            </div>
                        </div>
                        <p className="text-lg text-muted-foreground mb-4">
                            {language === "ar" ? product.descriptionAr : product.description}
                        </p>
                        <div className="flex items-baseline gap-4 mb-6">
                            <span className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</span>
                            <span className="text-lg text-muted-foreground line-through">{formatCurrency(product.price * 1.2)}</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="font-semibold">{t("product.seller")}:</span>
                            <div className="flex items-center gap-2">
                                <Image src="https://i.pravatar.cc/150?u=seller" alt="Seller" width={32} height={32} className="rounded-full" />
                                <Link href={`/seller/${product.sellerId}`} className="font-medium hover:underline">
                                    {product.sellerName || product.sellerId}
                                </Link>
                                <Button variant="outline" size="sm" onClick={handleContactSeller}>
                                    <MessageSquare className="ml-2 h-4 w-4" />
                                    {t("product.contactSeller")}
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-4 mb-8">
                            {user?.role === "customer" ? (
                                <>
                                    <Button onClick={handleAddToCart} size="lg" className="flex-1" disabled={product.stock === 0}>
                                        <ShoppingCart className="ml-2 h-5 w-5" />
                                        {product.stock === 0 ? t("product.outOfStock") : t("product.addToCart")}
                                    </Button>
                                    <Button onClick={handleWishlist} size="lg" variant={wishlisted ? "default" : "outline"}>
                                        <Heart className={`ml-2 h-5 w-5 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
                                    </Button>
                                </>
                            ) : (
                                <Button size="lg" className="flex-1" disabled>
                                    <ShoppingCart className="ml-2 h-5 w-5" />
                                    {t("header.login")}
                                </Button>
                            )}
                        </div>
                        <Separator />
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold mb-4">{t("product.customerReviews")}</h2>
                            {user && user.role === "customer" && (
                                <form onSubmit={handleReviewSubmit} className="mb-6">
                                    <div className="grid gap-4">
                                        <div>
                                            <Label htmlFor="rating">{t("product.rating")}</Label>
                                            <div className="flex items-center gap-1 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-6 h-6 cursor-pointer ${i < newRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                                                            }`}
                                                        onClick={() => setNewRating(i + 1)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="review">{t("product.yourReview")}</Label>
                                            <Textarea
                                                id="review"
                                                value={newReview}
                                                onChange={(e) => setNewReview(e.target.value)}
                                                placeholder={t("product.reviewPlaceholder")}
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="mt-4">
                                        <Send className="ml-2 h-4 w-4" />
                                        {t("product.submitReview")}
                                    </Button>
                                </form>
                            )}

                            {reviews.length === 0 ? (
                                <p className="text-muted-foreground">{t("product.noReviews")}</p>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <Card key={review.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center mb-2">
                                                    <Image src={`https://i.pravatar.cc/150?u=${review.userId}`} alt={review.userName} width={40} height={40} className="rounded-full" />
                                                    <div className="mx-3">
                                                        <p className="font-semibold">{review.userName}</p>
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground">{review.comment}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
