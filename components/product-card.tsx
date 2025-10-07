"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/lib/types";

interface ProductCardProps {
    product: Product;
    onRemoveFromWishlist?: (productId: string) => void;
}

export function ProductCard({ product, onRemoveFromWishlist }: ProductCardProps) {
    return (
        <Card className="w-full max-w-sm overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2">
            <CardHeader className="p-0">
                <Link href={`/products/${product.id}`} className="block relative aspect-square">
                    <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.nameAr}
                        fill
                        className="object-cover"
                    />
                    {product.featured && (
                        <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600">Featured</Badge>
                    )}
                </Link>
            </CardHeader>
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold truncate">{product.nameAr}</h3>
                <p className="text-sm text-muted-foreground mt-1 h-10 overflow-hidden">{product.descriptionAr}</p>
                <div className="flex items-center mt-2">
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 text-muted-foreground`} />
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">(No reviews yet)</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="text-xl font-bold text-primary">{formatCurrency(product.price)}</div>
                {onRemoveFromWishlist && (
                    <Button variant="outline" size="icon" onClick={() => onRemoveFromWishlist(product.id)}>
                        <Trash2 className="h-5 w-5" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
