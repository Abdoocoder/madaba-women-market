'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useLocale } from '@/lib/locale-context'
import { notFound, useParams } from 'next/navigation'
import { Star, Store } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
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
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)

  useEffect(() => {
    if (!sellerId) return

    const fetchSellerData = async () => {
      setLoading(true)
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sellerId)
          .single()

        if (profileError || !profileData || profileData.role !== 'seller') {
          notFound()
          return
        }

        const mappedSeller: User = {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          role: profileData.role,
          status: profileData.status,
          avatar: profileData.avatar_url,
          photoURL: profileData.avatar_url,
          phone: profileData.phone,
          storeName: profileData.store_name,
          storeDescription: profileData.store_description,
          storeCoverImage: profileData.store_cover_image,
          instagramUrl: profileData.instagram_url,
          whatsappUrl: profileData.whatsapp_url,
          rating: profileData.rating,
          reviewCount: profileData.review_count,
          followersCount: profileData.followers_count,
          createdAt: new Date(profileData.created_at)
        }
        setSeller(mappedSeller)
        setFollowersCount(mappedSeller.followersCount || 0)

      } catch (error) {
        console.error('Error fetching seller profile:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchSellerData()
  }, [sellerId])
  // ... rest of the file ...

  useEffect(() => {
    if (!user || user.role !== 'customer' || !sellerId) return

    const checkFollowingStatus = async () => {
      try {
        const response = await fetch(`/api/sellers/${sellerId}/follow`, {
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
  }, [user, sellerId])

  const handleFollow = async () => {
    if (!user) {
      toast({ title: t('common.error'), description: t('seller.loginToFollow'), variant: 'destructive' })
      return
    }
    if (user.role !== 'customer') {
      toast({ title: t('common.error'), description: t('seller.customersOnly'), variant: 'destructive' })
      return
    }

    try {
      const response = await fetch(`/api/sellers/${sellerId}/follow`, { method: 'POST' })
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
      console.error('Error following/unfollowing seller:', error)
      toast({ title: t('common.error'), description: t('messages.failedToFollowStore'), variant: 'destructive' })
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen"><p>{t('common.loading')}</p></div>
  if (!seller) return notFound()

  const rating = seller.rating || 4.5
  const reviewCount = seller.reviewCount || 120

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="max-w-2xl mx-auto border-0 shadow-2xl rounded-2xl overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-primary/10 to-secondary/10">
          {seller.storeCoverImage &&
            <Image src={seller.storeCoverImage} alt={seller.storeName || seller.name} fill style={{ objectFit: 'cover' }} />
          }
        </div>
        <CardContent className="p-6 text-center">
          <div className="relative -mt-16">
            <Avatar className="w-28 h-28 mx-auto border-4 border-background bg-background shadow-lg">
              <AvatarImage src={seller.avatar || seller.photoURL || ''} alt={seller.name} />
              <AvatarFallback className="text-3xl">{seller.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mt-4 mb-2">{seller.storeName || seller.name}</h1>

          {seller.storeDescription && <p className="text-muted-foreground my-3 max-w-lg mx-auto">{seller.storeDescription}</p>}

          <div className="flex items-center justify-center gap-1 text-yellow-500 my-4">
            {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-current' : 'stroke-current'}`} />)}
            <span className="text-muted-foreground text-sm ml-1">{rating.toFixed(1)} ({reviewCount} {t('product.reviews')})</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 my-6">
            <Link href={`/store/${sellerId}`} passHref>
              <Button size="lg" className="gap-2">
                <Store className="w-5 h-5" />
                {t('seller.visitStore')}
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={handleFollow} disabled={!user || user.role !== 'customer'}>
              {following ? t('seller.following') : t('seller.follow')}
              <span className="ms-2 font-semibold">({followersCount})</span>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>{t('seller.memberSince')} {new Date(seller.createdAt).toLocaleDateString()}</p>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
