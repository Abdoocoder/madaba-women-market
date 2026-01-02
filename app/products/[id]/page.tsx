"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Star, MessageSquare, ShoppingCart, Heart, Send, TrendingUp, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/locale-context";
import { formatCurrency } from "@/lib/utils";
import type { Product, Review } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="bg-muted h-32 w-32 rounded-full mb-4"></div>
                    <div className="h-4 bg-muted w-48 rounded"></div>
                </div>
            </div>
        );
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

            const currentWishlist = profile.wishlist || [];
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
            <main className="container py-12">
                <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">{language === "ar" ? product.nameAr : product.name}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                    {/* Product Image Gallery (Simplified as single image) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white dark:border-zinc-800">
                            <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.nameAr}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover hover:scale-105 transition-transform duration-500"
                                priority
                            />
                            {product.featured && (
                                <Badge className="absolute top-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white px-4 py-1 text-sm shadow-md">
                                    {t("product.featured")}
                                </Badge>
                            )}
                        </div>
                    </motion.div>

                    {/* Product Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col h-full"
                    >
                        <h1 className="text-3xl lg:text-5xl font-bold mb-4 text-balance leading-tight text-primary">
                            {language === "ar" ? product.nameAr : product.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 mb-6">
                            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/10 px-3 py-1.5 rounded-full border border-yellow-100 dark:border-yellow-900/30">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.floor(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600"
                                            }`}
                                    />
                                ))}
                                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-500 ml-2">
                                    {averageRating.toFixed(1)}
                                </span>
                            </div>
                            <span className="text-sm text-muted-foreground border-l pl-4 dark:border-zinc-700">
                                {reviews.length} {t("product.reviews")}
                            </span>
                            <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                                <TrendingUp className="w-4 h-4" />
                                <span>{purchaseCount} {t("product.purchases")}</span>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="text-4xl sm:text-5xl font-extrabold text-foreground">{formatCurrency(product.price)}</span>
                            {product.price > 0 && <span className="text-xl text-muted-foreground line-through decoration-2 decoration-red-400/50">{formatCurrency(product.price * 1.2)}</span>}
                        </div>

                        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                            {language === "ar" ? product.descriptionAr : product.description}
                        </p>

                        <div className="bg-muted/30 p-4 rounded-xl mb-8 border border-border">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border-2 border-primary/20">
                                    <Image src="https://i.pravatar.cc/150?u=seller" alt="Seller" width={48} height={48} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("product.seller")}</span>
                                    <Link href={`/seller/${product.sellerId}`} className="block font-medium text-lg hover:text-primary transition-colors hover:underline">
                                        {product.sellerName || product.sellerId}
                                    </Link>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleContactSeller} className="text-primary hover:text-primary hover:bg-primary/10">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    {t("product.contactSeller")}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-auto"></div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                            {user?.role === "customer" ? (
                                <>
                                    <Button
                                        onClick={handleAddToCart}
                                        size="lg"
                                        className="flex-1 h-14 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                                        disabled={product.stock === 0}
                                    >
                                        <ShoppingCart className="ml-2 h-5 w-5" />
                                        {product.stock === 0 ? t("product.outOfStock") : t("product.addToCart")}
                                    </Button>
                                    <Button
                                        onClick={handleWishlist}
                                        size="lg"
                                        variant="outline"
                                        className="h-14 w-14 rounded-xl border-2 hover:bg-muted/50"
                                    >
                                        <Heart className={`h-6 w-6 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
                                    </Button>
                                </>
                            ) : (
                                <Button size="lg" className="flex-1 h-14 text-lg rounded-xl" asChild>
                                    <Link href="/login">
                                        <ShoppingCart className="ml-2 h-5 w-5" />
                                        {t("header.login")}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>

                <Separator className="my-16" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold font-display">{t("product.customerReviews")}</h2>
                        {reviews.length > 0 && <Badge variant="secondary" className="text-base px-4 py-1">{reviews.length}</Badge>}
                    </div>

                    {user && user.role === "customer" && (
                        <Card className="mb-10 overflow-hidden border-primary/10 shadow-sm">
                            <CardContent className="p-8 bg-muted/10">
                                <h3 className="font-semibold text-lg mb-4 text-primary">Write a Review</h3>
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="grid gap-6">
                                        <div>
                                            <Label htmlFor="rating" className="text-sm uppercase tracking-wider text-muted-foreground">{t("product.rating")}</Label>
                                            <div className="flex items-center gap-2 mt-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-8 h-8 cursor-pointer transition-all hover:scale-110 ${i < newRating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 dark:text-zinc-700"
                                                            }`}
                                                        onClick={() => setNewRating(i + 1)}
                                                    />
                                                ))}
                                                <span className="font-bold text-lg ml-2">{newRating}/5</span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="review" className="text-sm uppercase tracking-wider text-muted-foreground">{t("product.yourReview")}</Label>
                                            <Textarea
                                                id="review"
                                                value={newReview}
                                                onChange={(e) => setNewReview(e.target.value)}
                                                placeholder={t("product.reviewPlaceholder")}
                                                required
                                                className="mt-2 min-h-[120px] resize-none border-border/60 focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <Button type="submit" size="lg" className="rounded-full px-8">
                                            <Send className="ml-2 h-4 w-4" />
                                            {t("product.submitReview")}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {reviews.length === 0 ? (
                        <div className="text-center py-16 bg-muted/10 rounded-2xl border border-dashed text-muted-foreground">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">{t("product.noReviews")}</p>
                            <p className="text-sm opacity-60">Be the first to review this product!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {reviews.map((review, i) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <Card className="border-border/50 hover:border-border transition-colors">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center">
                                                        <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4 border border-border">
                                                            <Image src={`https://i.pravatar.cc/150?u=${review.userId}`} alt={review.userName} fill className="object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground">{review.userName}</p>
                                                            <div className="flex items-center gap-0.5 mt-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 dark:text-zinc-700"
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="mt-4 pl-16">
                                                    <p className="text-foreground/80 leading-relaxed">{review.comment}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
