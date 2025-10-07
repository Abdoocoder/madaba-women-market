import type { Metadata } from "next";

// Generate metadata for seller pages
export async function generateSellerMetadata({ params }: { params: { sellerId: string } }): Promise<Metadata> {
  try {
    // Fetch seller from public API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/public/sellers/${params.sellerId}`);
    
    if (!response.ok) {
      return {
        title: "البائع غير موجود | Madaba Women Market",
        description: "البائع الذي تبحث عنه غير موجود.",
      };
    }
    
    const seller = await response.json();
    
    return {
      title: `${seller.storeName || seller.name} | Madaba Women Market`,
      description: seller.storeDescription || `تسوق من متجر ${seller.storeName || seller.name} على منصة مدريد للنساء`,
      keywords: ["متجر نسائي", "منتجات يدوية", seller.storeName || seller.name, "Madaba Women Market"],
      openGraph: {
        title: `${seller.storeName || seller.name} | Madaba Women Market`,
        description: seller.storeDescription || `تسوق من متجر ${seller.storeName || seller.name} على منصة مدريد للنساء`,
        images: [seller.storeCoverImage || "/placeholder.svg"],
        locale: "ar_JO",
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating metadata for seller:", error);
    return {
      title: "Madaba Women Market | متجر البائع",
      description: "تصفح منتجات البائع على منصة مدريد للنساء",
    };
  }
}