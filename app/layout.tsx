import { Cairo } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { LocaleProvider } from "@/lib/locale-context";
import { ThemeProvider } from "@/components/theme-provider";
import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { Footer } from "@/components/layout/footer";
import { ToasterProvider } from "@/components/toaster-provider";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"] });
export const metadata = {
  metadataBase: new URL("https://madaba-women-market.vercel.app"),
  title: {
    default: "سيدتي ماركت | منصة النساء في مادبا",
    template: "%s | سيدتي ماركت"
  },
  description: "منصة لدعم وتمكين سيدات مادبا عبر التجارة الإلكترونية. اكتشفي منتجات يدوية مميزة، أزياء، وحرف تقليدية.",
  keywords: ["مادبا", "سوق نسائي", "منتجات يدوية", "الأردن", "حرف", "تجارة إلكترونية"],
  authors: [{ name: "Madaba Women Market" }],
  creator: "Madaba Women Market",
  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: "https://madaba-women-market.vercel.app",
    title: "سيدتي ماركت | منصة النساء في مادبا",
    description: "منصة لدعم وتمكين سيدات مادبا عبر التجارة الإلكترونية.",
    siteName: "سيدتي ماركت",
  },
  twitter: {
    card: "summary_large_image",
    title: "سيدتي ماركت | منصة النساء في مادبا",
    description: "منصة لدعم وتمكين سيدات مادبا عبر التجارة الإلكترونية.",
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: 'v0.app',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MadabaMarket',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth">
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
                <ToasterProvider />
                <PWARegister />
                <HeaderWrapper />
                <div className="flex-grow pt-16">{children}</div>
                <Footer />
              </LocaleProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
