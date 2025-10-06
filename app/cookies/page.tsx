"use client"

import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CookiesPage() {
  const { t } = useLocale()

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
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("footer.cookies")}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  This is a placeholder for the Cookie Policy page. Content will be added soon.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
