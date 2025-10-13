'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/products/product-card'
import { useLocale } from '@/lib/locale-context'
import { notFound, useParams } from 'next/navigation'
import { Star } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/use-toast'
import type { User, Product, Review } from '@/lib/types'

export default function SellerStorePage() {
  const params = useParams()
  const storeId = params.storeId as string
  const { t, locale } = useLocale()
  const { user } = useAuth()
  const { toast } = useToast()
  const [seller, setSeller] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)

  useEffect(() => {
    if (!storeId) return
    
    const fetchData = async () => {
      setLoading(true)
      try {
        const userRef = doc(db, 'users', storeId)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists() || userSnap.data().role !== 'seller') {
          notFound()
          return
        }

        const sellerData = { id: userSnap.id, ...userSnap.data() } as User
        setSeller(sellerData)
        setFollowersCount(sellerData.followersCount || 0)

        const productsRef = collection(db, 'products')
        const q = query(productsRef, where('sellerId', '==', storeId))
        const querySnap = await getDocs(q)
        setProducts(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product)))
        
        // In a real app, these would be fetched from a sub-collection on the product or seller
        setReviews([
          {
            id: '1',
            userName: 'أحمد محمد',
            rating: 5,
            comment: 'منتجات ممتازة وجودة عالية. التوصيل كان سريع جداً.',
            createdAt: new Date('2023-10-15'),
            productId: 'mock-product-id',
            userId: 'mock-user-id'
          },
          {
            id: '2',
            userName: 'فاطمة علي',
            rating: 4,
            comment: 'متجر ممتاز مع خدمة عملاء رائعة. أنصح بالشراء.',
            createdAt: new Date('2023-11-20'),
            productId: 'mock-product-id',
            userId: 'mock-user-id'
          }
        ])
      } catch (error) {
        console.error('Error fetching store data:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [storeId])

  useEffect(() => {
    if (!user || user.role !== 'customer' || !seller) return
    
    const checkFollowingStatus = async () => {
      try {
        const response = await fetch(`/api/sellers/${storeId}/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkOnly: true })
        })
        if (response.ok) {
          const data = await response.json()
          setFollowing(data.isFollowing)
        }
      } catch (error) {
        console.error('Error checking following status:', error)
      }
    }
    checkFollowingStatus()
  }, [user, seller, storeId])

  const handleFollowStore = async () => {
    if (!user) {
      toast({ title: t('common.error'), description: t('seller.loginToFollow'), variant: 'destructive' })
      return
    }
    if (user.role !== 'customer') {
      toast({ title: t('common.error'), description: t('seller.customersOnly'), variant: 'destructive' })
      return
    }

    try {
      const response = await fetch(`/api/sellers/${storeId}/follow`, { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setFollowing(data.isFollowing)
        setFollowersCount(data.followersCount)
        toast({ title: t('common.success'), description: data.message })
      } else {
        const errorData = await response.json()
        toast({ title: t('common.error'), description: errorData.message, variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error following/unfollowing store:', error)
      toast({ title: t('common.error'), description: t('messages.failedToFollowStore'), variant: 'destructive' })
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen"><p>{t('common.loading')}</p></div>
  if (!seller) return notFound()

  const rating = seller.rating || 4.5
  const reviewCount = seller.reviewCount || 120

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="mb-8 border-2 border-primary/20 shadow-xl rounded-2xl overflow-hidden">
        {seller.storeCoverImage ? (
            <div className="relative w-full h-48 md:h-64">
              <Image src={seller.storeCoverImage} alt={seller.storeName || seller.name} fill style={{objectFit: 'cover'}} />
            </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-primary/10 to-secondary/10"></div>
        )}
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6 -mt-16 z-10 relative">
            <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-background bg-background shadow-md">
              <AvatarImage src={seller.avatar || seller.photoURL || ''} alt={seller.name} />
              <AvatarFallback className="text-3xl">{seller.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-1">{seller.storeName || seller.name}</h1>
              {seller.storeDescription && <p className="text-muted-foreground mt-2 max-w-2xl">{seller.storeDescription}</p>}
            </div>
            <div className="flex-shrink-0 flex flex-col items-center md:items-end gap-2">
                <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-current' : 'stroke-current'}`} />)}
                    <span className="text-muted-foreground text-sm ml-1">({reviewCount})</span>
                </div>
                <Button onClick={handleFollowStore} variant={following ? 'default' : 'outline'} disabled={!user || user.role !== 'customer'}>
                  {following ? t('seller.following') : t('seller.followStore')} ({followersCount})
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="products">{t('seller.products')}</TabsTrigger>
          <TabsTrigger value="reviews">{t('seller.reviews')}</TabsTrigger>
          <TabsTrigger value="about">{t('seller.about')}</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-12">{t('home.noProducts')}</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center">{t('seller.reviews')}</h2>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{review.userName}</h3>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString(locale)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-3 text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('seller.noReviewsYet')}</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="about">
            <Card className="max-w-3xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">{t('seller.aboutStore')}</h2>
                {seller.storeDescription ? (
                  <p className="text-muted-foreground mb-6 leading-relaxed">{seller.storeDescription}</p>
                ) : (
                  <p className="text-muted-foreground mb-6">{t('seller.noStoreDescription')}</p>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('seller.storeOwner')}</h3>
                    <p className="text-muted-foreground">{seller.name}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('seller.memberSince')}</h3>
                    <p className="text-muted-foreground">
                      {new Date(seller.createdAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('seller.totalProducts')}</h3>
                    <p className="text-muted-foreground">{products.length}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('seller.averageRating')}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-lg">{rating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm ml-1">({reviewCount} {t('product.reviews')})</span>
                    </div>
                  </div>
                </div>
                
                {(seller.instagramUrl || seller.whatsappUrl) && (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4 text-center">{t('seller.contactUs')}</h3>
                    <div className="flex justify-center gap-4">
                      {seller.instagramUrl && (
                        <a 
                          href={seller.instagramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-md hover:opacity-90 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                          </svg>
                          Instagram
                        </a>
                      )}
                      {seller.whatsappUrl && (
                        <a 
                          href={seller.whatsappUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#128C7E] transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
