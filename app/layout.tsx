import { Cairo } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { LocaleProvider } from "@/lib/locale-context";
import { ThemeProvider } from "@/components/theme-provider";
import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { Footer } from "@/components/layout/footer";
import { ToasterProvider } from "@/components/toaster-provider";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"] });
export const metadata = {
  metadataBase: new URL("https://madaba-women-market.vercel.app"), // استبدل بالرابط الفعلي
  title: "سيدتي ماركت | منصة النساء في مادبا",
  description: "منصة لدعم وتمكين سيدات مادبا عبر التجارة الإلكترونية.",
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>)
{
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
