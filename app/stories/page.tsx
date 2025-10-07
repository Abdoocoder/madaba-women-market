"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocale } from "@/lib/locale-context"
import Image from "next/image"
import Link from "next/link"

interface SuccessStory {
  id: string
  author: string
  story: string
  imageUrl?: string
  date: string
  sellerId?: string
}

export default function SuccessStoriesPage() {
  const { t } = useLocale()
  const [stories, setStories] = useState<SuccessStory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setError(null)
        const response = await fetch('/api/public/stories')
        if (!response.ok) {
          throw new Error(`Failed to fetch stories: ${response.status} ${response.statusText}`)
        }
        const storiesData = await response.json()
        setStories(storiesData)
      } catch (error) {
        console.error('Error fetching stories:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch stories')
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <p className="text-red-500">{t('messages.failedToFetchStories')}</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('home.successStories')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('home.successStoriesDescription')}
        </p>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('admin.stories.noStories')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden">
              {story.imageUrl && (
                <div className="relative h-48 w-full">
                  <Image
                    src={story.imageUrl}
                    alt={story.author}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{story.author}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-4">
                  {story.story}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(story.date).toLocaleDateString()}
                </p>
                {story.sellerId && (
                  <div className="mt-4">
                    <Link 
                      href={`/seller/${story.sellerId}`} 
                      className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      {t("home.viewSellerStore")}
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
