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

  if (loading) return <p>Loading...</p>
  if (!seller) return notFound()

  const rating = seller.rating || 4.5
  const reviewCount = seller.reviewCount || 120

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary">
            <AvatarImage src={seller.avatar} alt={seller.name} />
            <AvatarFallback>{seller.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight">{seller.name}</h1>
            <p className="text-muted-foreground mt-1">
              {t('seller.memberSince') || 'Member Since'}{' '}
              {new Date(seller.createdAt).toLocaleDateString()}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-current' : 'stroke-current'}`} />
                ))}
              </div>
              <span className="text-muted-foreground">
                ({reviewCount} {t('seller.reviews') || 'reviews'})
              </span>
            </div>
            <p className="mt-4 max-w-lg text-foreground/80">
              {seller.bio || t('seller.bioPlaceholder') || 'This seller has not yet provided a biography.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          {t('seller.myProducts') || 'My Products'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <p>{t('home.noProducts') || 'No products yet.'}</p>
          )}
        </div>
      </div>
    </div>
  )
}
