"use client"

import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, FileText, Scale, AlertTriangle } from "lucide-react"

export default function TermsPage() {
  const { t } = useLocale()

  const termsSections = [
    {
      title: t("terms.acceptance"),
      content: t("terms.acceptanceContent"),
      icon: FileText
    },
    {
      title: t("terms.services"),
      content: t("terms.servicesContent"),
      icon: Scale
    },
    {
      title: t("terms.userObligations"),
      content: t("terms.userObligationsContent"),
      icon: AlertTriangle
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
            <h1 className="text-4xl font-bold mb-4">{t("footer.terms")}</h1>
            <p className="text-muted-foreground text-lg">
              {t("terms.lastUpdated", { date: "2024-01-15" })}
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Scale className="h-6 w-6 text-primary" />
                {t("terms.overview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms.overviewContent")}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {termsSections.map((section, index) => {
              const Icon = section.icon
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t("terms.contact")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("terms.contactContent")}
              </p>
              <Link href="/contact">
                <Button>
                  {t("footer.contact")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
