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
import { StoreRating } from '@/components/seller/store-rating'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/use-toast'
import type { User } from '@/lib/types'

export default function SellerProfilePage() {
  const params = useParams()
  const sellerId = params.sellerId as string
  const { t } = useLocale()
  const { user } = useAuth()
  const { toast } = useToast()
  const [seller, setSeller] = useState<User | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)

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

        const sellerData = { id: userSnap.id, ...userSnap.data() } as User
        setSeller(sellerData)
        setFollowersCount(sellerData.followersCount || 0)

        const productsRef = collection(db, 'products')
        const q = query(productsRef, where('sellerId', '==', sellerId))
        const querySnap = await getDocs(q)
        setProducts(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        
        // Mock reviews for now - in a real app, these would come from a reviews collection
        setReviews([
          {
            id: '1',
            userName: 'أحمد محمد',
            rating: 5,
            comment: 'منتجات ممتازة وجودة عالية. التوصيل كان سريع جداً.',
            date: new Date('2023-10-15')
          },
          {
            id: '2',
            userName: 'فاطمة علي',
            rating: 4,
            comment: 'متجر ممتاز مع خدمة عملاء رائعة. أنصح بالشراء.',
            date: new Date('2023-11-20')
          },
          {
            id: '3',
            userName: 'سارة عبدالله',
            rating: 5,
            comment: 'جودة المنتجات مذهلة وخدمة التوصيل ممتازة.',
            date: new Date('2023-12-05')
          }
        ])
      } catch (error) {
        console.error('Error fetching seller:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sellerId])

  useEffect(() => {
    // Check if current user is following this seller
    const checkFollowingStatus = async () => {
      if (!user || user.role !== 'customer') return
      
      try {
        const response = await fetch(`/api/sellers/${sellerId}/follow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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

    if (user && sellerId) {
      checkFollowingStatus()
    }
  }, [user, sellerId])

  const handleFollowStore = async () => {
    if (!user) {
      toast({
        title: t('common.error'),
        description: t('seller.loginToFollow'),
        variant: 'destructive'
      })
      return
    }
    
    if (user.role !== 'customer') {
      toast({
        title: t('common.error'),
        description: t('seller.customersOnly'),
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch(`/api/sellers/${sellerId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFollowing(data.isFollowing)
        setFollowersCount(data.followersCount)
        toast({
          title: t('common.success'),
          description: data.message
        })
      } else {
        const errorData = await response.json()
        toast({
          title: t('common.error'),
          description: errorData.message,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error following/unfollowing store:', error)
      toast({
        title: t('common.error'),
        description: t('messages.failedToFollowStore'),
        variant: 'destructive'
      })
    }
  }

  if (loading) return <p className="container mx-auto py-8">{t('common.loading')}</p>
  if (!seller) return notFound()

  const rating = seller.rating || 4.5
  const reviewCount = seller.reviewCount || 120

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Store Cover Image */}
      {seller.storeCoverImage ? (
        <div className="relative w-full h-64 rounded-lg overflow-hidden mb-8">
          <Image 
            src={seller.storeCoverImage} 
            alt={seller.storeName || seller.name} 
            fill
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg mb-8"></div>
      )}

      {/* Seller Info Card */}
      <Card className="mb-8 border-0 shadow-lg rounded-xl overflow-hidden -mt-16 relative z-10 mx-4 md:mx-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative -mt-16 md:-mt-0">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background rounded-full bg-background">
                <AvatarImage src={seller.avatar || seller.photoURL || ""} alt={seller.name} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {seller.name?.charAt(0)}
                </AvatarFallback>
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
              
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {t('seller.memberSince')} {new Date(seller.createdAt).toLocaleDateString()}
                </p>
                <Button 
                  onClick={handleFollowStore}
                  variant={following ? "default" : "outline"}
                  className="whitespace-nowrap"
                  disabled={!user || user.role !== 'customer'}
                >
                  {following ? t('seller.following') : t('seller.followStore')}
                  <span className="ms-2">({followersCount})</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">{t('seller.products')}</TabsTrigger>
          <TabsTrigger value="reviews">{t('seller.reviews')}</TabsTrigger>
          <TabsTrigger value="about">{t('seller.about')}</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">{t('home.noProducts')}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{review.userName}</h3>
                          <span className="text-sm text-muted-foreground">
                            {review.date.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-muted-foreground">{review.comment}</p>
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

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">{t('seller.aboutStore')}</h2>
              {seller.storeDescription ? (
                <p className="text-muted-foreground mb-6">{seller.storeDescription}</p>
              ) : (
                <p className="text-muted-foreground mb-6">{t('seller.noStoreDescription')}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('seller.storeOwner')}</h3>
                  <p className="text-muted-foreground">{seller.name}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('seller.memberSince')}</h3>
                  <p className="text-muted-foreground">
                    {new Date(seller.createdAt).toLocaleDateString()}
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
                    <span className="text-muted-foreground">{rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              {(seller.instagramUrl || seller.whatsappUrl) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">{t('seller.contactUs')}</h3>
                  <div className="flex gap-3">
                    {seller.instagramUrl && (
                      <a 
                        href={seller.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
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
