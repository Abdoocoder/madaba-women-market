'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductCard } from '@/components/product/product-card'
import { MOCK_PRODUCTS, MOCK_USERS } from '@/lib/mock-data'
import { useLocale } from '@/lib/locale-context'
import { notFound } from 'next/navigation'
import { Star } from 'lucide-react'

interface SellerProfilePageProps {
  params: {
    sellerId: string
  }
}

export default function SellerProfilePage({ params }: SellerProfilePageProps) {
  const { t } = useLocale()
  const seller = MOCK_USERS.find((user) => user.id === params.sellerId && user.role === 'seller')
  const sellerProducts = MOCK_PRODUCTS.filter((product) => product.sellerId === params.sellerId)

  if (!seller) {
    notFound()
  }

  // Mock rating
  const rating = 4.5
  const reviewCount = 120

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary">
            <AvatarImage src={seller.avatar} alt={seller.name} />
            <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight">{seller.name}</h1>
            <p className="text-muted-foreground mt-1">{t('seller.memberSince') || 'Member Since'} {new Date(seller.joinDate).toLocaleDateString()}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-current' : 'stroke-current'}`} />
                ))}
              </div>
              <span className="text-muted-foreground">({reviewCount} {t('seller.reviews') || 'reviews'})</span>
            </div>
            <p className="mt-4 max-w-lg text-foreground/80">{
              seller.bio || t('seller.bioPlaceholder') || 'This seller has not yet provided a biography.'
            }</p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">{t('seller.myProducts') || 'My Products'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sellerProducts.length > 0 ? (
            sellerProducts.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p>{t('home.noProducts')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
