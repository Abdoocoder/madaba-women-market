'use client'

import { useState, useEffect } from 'react'
import { notFound, useParams } from 'next/navigation'
import Image from 'next/image'
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useLocale } from '@/lib/locale-context'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, ShoppingCart } from 'lucide-react'
import type { Product, User } from '@/lib/types'
import { ProductCard } from '@/components/products/product-card'

// This is the product detail page scoped to a specific store.

export default function StoreProductPage() {
  const params = useParams()
  const storeId = params.storeId as string
  const productId = params.productId as string
  
  // Debugging: Log route parameters
  useEffect(() => {
    console.log("Store product page params:", { storeId, productId });
    if (!storeId) {
      console.error("Missing storeId parameter");
    }
    if (!productId) {
      console.error("Missing productId parameter");
    }
    
    if (!storeId || !productId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Debugging: Log what we're trying to fetch
        console.log("Fetching product data for:", { storeId, productId });
        
        // Fetch product data
        const productRef = doc(db, 'products', productId)
        const productSnap = await getDoc(productRef)

        if (!productSnap.exists() || productSnap.data().sellerId !== storeId) {
          console.error("Product not found or doesn't belong to store:", { productId, storeId });
          notFound()
          return
        }
        const productData = { id: productSnap.id, ...productSnap.data() } as Product
        console.log("Fetched product data:", productData);
        setProduct(productData)

        // Fetch seller data
        const sellerRef = doc(db, 'users', storeId)
        const sellerSnap = await getDoc(sellerRef)
        if (sellerSnap.exists()) {
          const sellerData = { id: sellerSnap.id, ...sellerSnap.data() } as User
          console.log("Fetched seller data:", sellerData);
          setSeller(sellerData)
        }

        // Fetch related products from the same category and seller
        const relatedQuery = query(
          collection(db, 'products'),
          where('sellerId', '==', storeId),
          where('category', '==', productData.category),
          where('id', '!=', productId)
          // limit(4) // you might want to limit the results
        )
        const relatedSnap = await getDocs(relatedQuery)
        const relatedProductsData = relatedSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Product))
          .filter(product => product.id && product.id.trim() !== '') // Filter out products without valid IDs
        console.log("Fetched related products:", relatedProductsData);
        setRelatedProducts(relatedProductsData)

      } catch (error) {
        console.error("Error fetching product or seller data:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchData()

  }, [storeId, productId]);
  
  const { t, language } = useLocale()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [seller, setSeller] = useState<User | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  if (loading) return <div className="flex justify-center items-center h-screen"><p>{t('common.loading')}</p></div>
  if (!product) return notFound()

  // Use default values since rating and reviewCount are not in the Product model
  const rating = 4.5
  const reviewCount = 0

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="relative h-96 md:h-full bg-muted rounded-lg overflow-hidden">
                {product.image && (
                    <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill 
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">{product.name}</h1>
                
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-current' : 'stroke-current'}`} />)}
                    </div>
                    <span className="text-muted-foreground">({reviewCount} {t('product.reviews')})</span>
                </div>
                
                <p className="text-2xl lg:text-3xl font-extrabold mb-6">
                    {new Intl.NumberFormat(language === 'ar' ? 'ar-JO' : 'en-JO', { style: 'currency', currency: 'JOD' }).format(product.price)}
                </p>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
                
                <Button size="lg" onClick={() => addToCart(product)} className="gap-2 w-full md:w-auto">
                    <ShoppingCart className="w-5 h-5" />
                    {t('product.addToCart')}
                </Button>

                {seller && (
                    <Card className="mt-8">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={seller.avatar || seller.photoURL || ''} alt={seller.name} />
                                <AvatarFallback>{seller.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{t('product.soldBy')}</p>
                                <p className="text-muted-foreground">{seller.storeName || seller.name}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>

        {/* Related Products */}
        {relatedProducts
          .filter(product => product.id && product.id.trim() !== '') // Filter out products without valid IDs
          .length > 0 && (
            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6">{t('product.relatedProducts')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts
                      .filter(product => product.id && product.id.trim() !== '') // Filter out products without valid IDs
                      .map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            </div>
        )}
    </div>
  )
}
