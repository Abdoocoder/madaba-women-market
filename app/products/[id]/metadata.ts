import type { Metadata } from "next";

// This is a helper function to generate metadata for product pages
export async function generateProductMetadata(productId: string): Promise<Metadata> {
  try {
    // Fetch product from public API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/public/products/${productId}`);
    
    if (!response.ok) {
      return {
        title: "المنتج غير موجود | Madaba Women Market",
        description: "المنتج الذي تبحث عنه غير موجود.",
      };
    }
    
    const product = await response.json();
    
    return {
      title: `${product.nameAr} | Madaba Women Market`,
      description: product.descriptionAr,
      keywords: [product.category, "منتج نسائي", " handmade", product.nameAr],
      openGraph: {
        title: `${product.nameAr} | Madaba Women Market`,
        description: product.descriptionAr,
        images: [product.image || "/placeholder.svg"],
        locale: "ar_JO",
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating metadata for product:", error);
    return {
      title: "Madaba Women Market",
      description: "منصة التجارة الإلكترونية للنساء",
    };
  }
}
