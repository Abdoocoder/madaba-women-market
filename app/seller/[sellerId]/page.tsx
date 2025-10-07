'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/products/product-card'
import { useLocale } from '@/lib/locale-context'
import { notFound, useParams } from 'next/navigation'
import { Star } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { StoreRating } from '@/components/seller/store-rating'

export default function SellerProfilePage() {
  const params = useParams()
  const sellerId = params.sellerId as string
  const { t } = useLocale()
  const [seller, setSeller] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sellerId) return
    
    const fetchData = async () => {
      try {
        const userRef = doc(db, 'users', sellerId)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          notFound()
          return
        }

        setSeller({ id: userSnap.id, ...userSnap.data() })

        const productsRef = collection(db, 'products')
        const q = query(productsRef, where('sellerId', '==', sellerId))
        const querySnap = await getDocs(q)
        setProducts(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      } catch (error) {
        console.error('Error fetching seller:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sellerId])

  if (loading) return <p className="container mx-auto py-8">{t('common.loading')}</p>
  if (!seller) return notFound()

  const rating = seller.rating || 4.5
  const reviewCount = seller.reviewCount || 120

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Store Cover Image */}
      {seller.storeCoverImage && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden mb-8">
          <img 
            src={seller.storeCoverImage} 
            alt={seller.storeName || seller.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
        </div>
      )}

      {/* Seller Info Card */}
      <Card className="mb-8 border-0 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary rounded-full">
                <AvatarImage src={seller.avatar || seller.photoURL} alt={seller.name} />
                <AvatarFallback className="text-2xl">{seller.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {seller.storeName || seller.name}
              </h1>
              
              {seller.storeDescription && (
                <p className="text-muted-foreground mt-2 mb-4 max-w-2xl">
                  {seller.storeDescription}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <div className="flex flex-col items-center md:items-start">
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-current' : 'stroke-current'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground text-sm mt-1">
                    {rating.toFixed(1)} ({reviewCount} {t('product.reviews')})
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {seller.instagramUrl && (
                    <a 
                      href={seller.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                  )}
                  
                  {seller.whatsappUrl && (
                    <a 
                      href={seller.whatsappUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              
              <p className="mt-4 text-sm text-muted-foreground">
                {t('seller.memberSince')} {new Date(seller.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-6 pb-2 border-b">
          {t('seller.products')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">{t('home.noProducts')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
