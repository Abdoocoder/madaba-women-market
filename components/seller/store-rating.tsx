'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { useLocale } from '@/lib/locale-context'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'

interface StoreRatingProps {
  sellerId: string
  currentRating: number
  reviewCount: number
}

export function StoreRating({ sellerId, currentRating, reviewCount }: StoreRatingProps) {
  const { t } = useLocale()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleRating = async (value: number) => {
    if (submitted) return
    
    setRating(value)
    
    try {
      // In a real implementation, you would save this to a ratings collection
      // For now, we'll just simulate the update
      
      // Update the UI immediately
      setSubmitted(true)
      
      toast({
        title: t('common.success'),
        description: t('messages.ratingSubmitted')
      })
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast({
        title: t('common.error'),
        description: t('messages.failedToSubmitRating'),
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
          const ratingValue = i + 1
          return (
            <button
              key={i}
              type="button"
              className={`${
                ratingValue <= (hover || rating)
                  ? 'text-yellow-500'
                  : 'text-gray-300'
              } bg-transparent border-0 p-0 cursor-pointer`}
              onClick={() => handleRating(ratingValue)}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
              disabled={submitted}
            >
              <Star className="w-6 h-6 fill-current" />
            </button>
          )
        })}
      </div>
      
      <div className="text-sm text-muted-foreground">
        {submitted ? (
          <span>{t('messages.thankYouForRating')}</span>
        ) : (
          <span>
            {currentRating.toFixed(1)} ({reviewCount} {t('product.reviews')})
          </span>
        )}
      </div>
    </div>
  )
}
