"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocale } from "@/lib/locale-context"
import Image from "next/image"

interface SuccessStory {
  id: string
  author: string
  story: string
  imageUrl?: string
  date: string
}

export default function SuccessStoriesPage() {
  const { t } = useLocale()
  const [stories, setStories] = useState<SuccessStory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/public/stories')
        if (!response.ok) {
          throw new Error('Failed to fetch stories')
        }
        const storiesData = await response.json()
        setStories(storiesData)
      } catch (error) {
        console.error('Error fetching stories:', error)
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}