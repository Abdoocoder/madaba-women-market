"use client"

import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Cookie, Settings, BarChart3 } from "lucide-react"

export default function CookiesPage() {
  const { t } = useLocale()

  const cookieTypes = [
    {
      title: t("cookies.essential"),
      content: t("cookies.essentialContent"),
      icon: Settings
    },
    {
      title: t("cookies.functional"),
      content: t("cookies.functionalContent"),
      icon: Cookie
    },
    {
      title: t("cookies.analytics"),
      content: t("cookies.analyticsContent"),
      icon: BarChart3
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.backToHome")}
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-4">{t("footer.cookies")}</h1>
            <p className="text-muted-foreground text-lg">
              {t("cookies.lastUpdated", { date: "2024-01-15" })}
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Cookie className="h-6 w-6 text-primary" />
                {t("cookies.overview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {t("cookies.overviewContent")}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {cookieTypes.map((cookieType, index) => {
              const Icon = cookieType.icon
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      {cookieType.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {cookieType.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t("cookies.manage")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("cookies.manageContent")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button>
                  {t("cookies.acceptAll")}
                </Button>
                <Button variant="outline">
                  {t("cookies.managePreferences")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
