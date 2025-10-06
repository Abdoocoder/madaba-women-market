"use client"

import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// ✅ بيانات الميتا للصفحة (SEO)
export const metadata = {
  title: "سياسة الخصوصية | Madaba Women Market",
  description: "تعرف على كيفية حماية بياناتك في منصة مادبا وومن ماركت.",
}

export default function PrivacyPage() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* العودة إلى الرئيسية */}
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.backToHome")}
              </Button>
            </Link>
          </div>

          {/* عنوان الصفحة */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              {t("footer.privacy")}
            </h1>
            <p className="text-muted-foreground">
              {t("privacy.lastUpdated")}: 6 أكتوبر 2025
            </p>
          </div>

          {/* المحتوى */}
          <Card className="shadow-lg border border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">{t("privacy.introTitle")}</CardTitle>
            </CardHeader>

            <CardContent className="prose prose-lg dark:prose-invert max-w-none space-y-6 leading-relaxed">
              
              <section>
                <p>{t("privacy.intro")}</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground">{t("privacy.dataCollectedTitle")}</h3>
                <ul className="list-disc ps-5 space-y-2">
                  <li>{t("privacy.dataCollected.name")}</li>
                  <li>{t("privacy.dataCollected.address")}</li>
                  <li>{t("privacy.dataCollected.usage")}</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground">{t("privacy.usageTitle")}</h3>
                <p>{t("privacy.usageText")}</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground">{t("privacy.securityTitle")}</h3>
                <p>{t("privacy.securityText")}</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground">{t("privacy.rightsTitle")}</h3>
                <p>{t("privacy.rightsText")}</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground">{t("privacy.contactTitle")}</h3>
                <p>{t("privacy.contactText")}</p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
