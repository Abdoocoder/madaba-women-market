"use client"

import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
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
            <h1 className="text-4xl font-bold mb-4">{t("footer.contact")}</h1>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("footer.contactUs")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{t("footer.address")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <Link href="tel:+962123456789" className="hover:text-primary transition-colors">
                    +962 12 345 6789
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <Link href="mailto:info@madabawomenmarket.com" className="hover:text-primary transition-colors">
                    info@madabawomenmarket.com
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
