"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocale } from "@/lib/locale-context"

interface SuccessStory {
  id: string;
  author: string;
  story: string;
  imageUrl?: string;
  date: string;
  sellerId?: string;
}

export function SuccessStories() {
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
        // Limit to 3 stories for the homepage
        setStories(storiesData.slice(0, 3))
      } catch (error) {
        console.error('Error fetching stories:', error)
        // Fallback to mock data if API fails
        setStories([
          {
            id: "1",
            author: "نورة خالد",
            story: "بفضل سيدتي ماركت، تمكنت من الوصول إلى شريحة واسعة من الزبائن وعرض منتجاتي بكل سهولة. المنصة سهلة الاستخدام وفريق الدعم متعاون جداً.",
            imageUrl: "/placeholder-user.jpg",
            date: new Date().toISOString(),
            sellerId: "seller1", // Add mock sellerId
          },
          {
            id: "2",
            author: "فاطمة عبد الله",
            story: "تجربتي مع سيدتي ماركت كانت رائعة. لقد بدأت بمشروع صغير من المنزل والآن لدي متجري الخاص الذي يحقق مبيعات ممتازة. شكراً لكم!",
            imageUrl: "/placeholder-user.jpg",
            date: new Date().toISOString(),
            sellerId: "seller2", // Add mock sellerId
          },
          {
            id: "3",
            author: "عائشة محمد",
            story: "وجدت في سيدتي ماركت البيئة المثالية لعرض أعمالي اليدوية. التصميم الأنيق والتركيز على المنتجات النسائية ساعدني في بناء علامتي التجارية.",
            imageUrl: "/placeholder-user.jpg",
            date: new Date().toISOString(),
            sellerId: "seller3", // Add mock sellerId
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  if (loading) {
    return (
      <div className="py-12 bg-muted/40">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8">{t("home.successStories")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-gray-200 w-14 h-14 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-muted/40">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-8">{t("home.successStories")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <div key={story.id} className="p-4">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Image
                    src={story.imageUrl || "/placeholder-user.jpg"}
                    alt={story.author}
                    width={56}
                    height={56}
                    className="rounded-full"
                  />
                  <div>
                    <CardTitle>{story.author}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">&quot;{story.story}&quot;</p>
                  {story.sellerId && (
                    <div className="mt-4">
                      <a 
                        href={`/seller/${story.sellerId}`} 
                        className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        {t("home.viewSellerStore")}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}