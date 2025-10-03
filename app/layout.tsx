import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"
import { LocaleProvider } from "@/lib/locale-context"
import { Suspense } from "react"
import "./globals.css"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
})

export const metadata: Metadata = {
  title: "سيدتي ماركت - Seydaty Market",
  description: "منصة تسوق إلكترونية للسيدات",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`font-sans ${cairo.variable} antialiased`}>
        <LocaleProvider>
          <AuthProvider>
            <CartProvider>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </CartProvider>
          </AuthProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
