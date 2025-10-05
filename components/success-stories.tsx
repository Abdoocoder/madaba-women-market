"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MOCK_SUCCESS_STORIES } from "@/lib/mock-stories"
import { useLocale } from "@/lib/locale-context"

export function SuccessStories() {
  const { t } = useLocale()

  return (
    <div className="py-12 bg-muted/40">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-8">{t("home.successStories")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_SUCCESS_STORIES.map((story) => (
            <div key={story.id} className="p-4">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Image
                    src={story.avatarUrl || "/placeholder-user.jpg"}
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
                  <p className="text-muted-foreground">"{story.story}"</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
