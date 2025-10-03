import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "Sayidati Market",
  description: "An e-commerce platform for women's products",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>)
{
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${cairo.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <Toaster position="bottom-center" />
          <div className="flex-grow">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
