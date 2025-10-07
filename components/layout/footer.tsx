"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  const { t } = useLocale()

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "Youtube" },
  ]

  const quickLinks = [
    { href: "/", label: t("footer.home") },
    { href: "/products", label: t("footer.products") },
    { href: "/about", label: t("footer.about") },
    { href: "/contact", label: t("footer.contact") },
  ]

  const supportLinks = [
    { href: "/help", label: t("footer.help") },
    { href: "/privacy", label: t("footer.privacy") },
    { href: "/terms", label: t("footer.terms") },
    { href: "/faq", label: t("footer.faq") },
  ]

  return (
    <footer className="bg-background border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/placeholder-logo.svg" 
                alt={t("app.name")} 
                width={32} 
                height={32} 
                className="h-8 w-8" 
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t("app.name")}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="text-muted-foreground hover:text-primary transition-all duration-200 hover:-translate-y-1"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t("footer.support")}</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t("footer.contactUs")}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{t("footer.address")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <Link href="tel:+962123456789" className="hover:text-primary transition-colors">
                  +962 12 345 6789
                </Link>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <Link href="mailto:info@madabawomenmarket.com" className="hover:text-primary transition-colors">
                  info@madabawomenmarket.com
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>
              {t("footer.copyright", { year: new Date().getFullYear() })} 
              <span className="font-medium text-foreground"> {t("app.name")}</span>. 
              {t("footer.allRightsReserved")}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors duration-200">
              {t("footer.privacy")}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-primary transition-colors duration-200">
              {t("footer.terms")}
            </Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-primary transition-colors duration-200">
              {t("footer.cookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
