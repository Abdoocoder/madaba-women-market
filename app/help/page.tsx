"use client"

import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, MessageSquare, Phone, Mail, HelpCircle } from "lucide-react"

export default function HelpPage() {
  const { t } = useLocale()

  const helpTopics = [
    {
      title: t("help.account"),
      description: t("help.accountDesc"),
      icon: HelpCircle
    },
    {
      title: t("help.orders"),
      description: t("help.ordersDesc"),
      icon: HelpCircle
    },
    {
      title: t("help.payments"),
      description: t("help.paymentsDesc"),
      icon: HelpCircle
    },
    {
      title: t("help.shipping"),
      description: t("help.shippingDesc"),
      icon: HelpCircle
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
            <h1 className="text-4xl font-bold mb-4">{t("footer.help")}</h1>
            <p className="text-muted-foreground text-lg">
              {t("help.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {helpTopics.map((topic, index) => {
              const Icon = topic.icon
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      {topic.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{topic.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("help.contactSupport")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t("help.contactDescription")}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t("help.liveChat")}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="mr-2 h-4 w-4" />
                  {t("help.callUs")}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="mr-2 h-4 w-4" />
                  {t("help.emailUs")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
