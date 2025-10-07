import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { LocaleProvider } from "@/lib/locale-context";
import { ThemeProvider } from "@/components/theme-provider";
import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { Footer } from "@/components/layout/footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Madaba Women Market",
    default: "Madaba Women Market | منصة التجارة الإلكترونية للنساء"
  },
  description: "اكتشفي أفضل المنتجات النسائية المصنوعة يدويًا من قبل نساء مبدعات في مدريد. تسوق الآن وادعم المشاريع النسائية.",
  keywords: ["متجر نسائي", "منتجات يدوية", "نساء مبدعات", "مدريد", "المنتجات النسائية", "ال handmade", "ال Woman Market"],
  authors: [{ name: "Madaba Women Market Team" }],
  creator: "Madaba Women Market",
  publisher: "Madaba Women Market",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Madaba Women Market | منصة التجارة الإلكترونية للنساء",
    description: "اكتشفي أفضل المنتجات النسائية المصنوعة يدويًا من قبل نساء مبدعات في مدريد. تسوق الآن وادعم المشاريع النسائية.",
    url: "https://your-domain.com",
    siteName: "Madaba Women Market",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Madaba Women Market",
      },
    ],
    locale: "ar_JO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Madaba Women Market | منصة التجارة الإلكترونية للنساء",
    description: "اكتشفي أفضل المنتجات النسائية المصنوعة يدويًا من قبل نساء مبدعات في مدريد. تسوق الآن وادعم المشاريع النسائية.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://your-domain.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>)
{
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${cairo.className} flex flex-col min-h-screen`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              <LocaleProvider>
                <div suppressHydrationWarning>
                  <Toaster position="bottom-center" />
                </div>
                <HeaderWrapper />
                <div className="flex-grow pt-16">{children}</div>
                <Footer />
              </LocaleProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}