"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { MOCK_SUCCESS_STORIES } from "@/lib/mock-stories"
import { useLocale } from "@/lib/locale-context"

export function SuccessStories() {
  const { t } = useLocale()

  return (
    <div className="py-12 bg-muted/40">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-8">{t("home.successStories")}</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {MOCK_SUCCESS_STORIES.map((story) => (
              <CarouselItem key={story.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-4">
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
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  )
}
