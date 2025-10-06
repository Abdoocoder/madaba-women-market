"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Star, MessageSquare, ShoppingCart, Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MOCK_PRODUCTS, MOCK_REVIEWS } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/locale-context";
import { formatCurrency } from "@/lib/utils";
import type { Product, Review } from "@/lib/types";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

export default function ProductDetailPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [wishlisted, setWishlisted] = useState(false);
    const [newReview, setNewReview] = useState("");
    const [newRating, setNewRating] = useState(5);

    const { id } = useParams();
    const { addToCart, totalItems } = useCart();
    const { user, isLoading: isAuthLoading } = useAuth();
    const { t, language } = useLocale();
    const { toast } = useToast();

    useEffect(() => {
        const fetchProductAndWishlist = async () => {
            try {
                // Fetch product from public API
                const response = await fetch(`/api/public/products/${id}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        notFound();
                    }
                    throw new Error('Failed to fetch product');
                }
                
                const fetchedProduct = await response.json();
                setProduct(fetchedProduct);
                
                // Fetch reviews (keeping mock data for now, but this should be replaced with real reviews)
                setReviews(MOCK_REVIEWS.filter((r) => r.productId === id));

                if (user) {
                    const wishlistRef = doc(db, "wishlists", user.id);
                    const wishlistSnap = await getDoc(wishlistRef);
                    if (wishlistSnap.exists() && wishlistSnap.data().products.includes(id as string)) {
                        setWishlisted(true);
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

        const wishlistRef = doc(db, "wishlists", user.id);
        
        try {
            if (wishlisted) {
                await updateDoc(wishlistRef, { products: arrayRemove(product.id) });
                toast({ title: t("product.removed"), description: t("product.removedFromWishlist"), variant: "success" });
            } else {
                await setDoc(wishlistRef, { products: arrayUnion(product.id) }, { merge: true });
                toast({ title: t("product.added"), description: t("product.addedToWishlist"), variant: "success" });
            }
            setWishlisted(!wishlisted);
        } catch (error) {
            console.error("Error updating wishlist: ", error);
            toast({ title: t("product.error"), description: t("product.failedToUpdateWishlist"), variant: "destructive" });
        }
    };

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newReview) return;

        const review: Review = {
            id: new Date().toISOString(),
            productId: product.id,
            userId: user.id,
            userName: user.name,
            rating: newRating,
            comment: newReview,
            createdAt: new Date(),
        };
        setReviews([review, ...reviews]);
        setNewReview("");
        setNewRating(5);
        // In a real app, you would post the review to the backend
    };

    const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

    return (
        <div className="min-h-screen bg-background">
            <main className="container py-8">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    <div>
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                            <Image src={product.image || "/placeholder.svg"} alt={product.nameAr} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
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
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${
                                            i < Math.floor(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-muted-foreground">({reviews.length} {t("product.reviews")})</span>
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
                                <Image src="/placeholder-user.jpg" alt="Seller" width={32} height={32} className="rounded-full" />
                                <span className="font-medium">{product.sellerName || product.sellerId}</span>
                                <Button variant="outline" size="sm">
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
                                                        className={`w-6 h-6 cursor-pointer ${
                                                            i < newRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
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
                                                    <Image src="/placeholder-user.jpg" alt={review.userName} width={40} height={40} className="rounded-full" />
                                                    <div className="mx-3">
                                                        <p className="font-semibold">{review.userName}</p>
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${
                                                                        i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
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
