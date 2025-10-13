"use client";

import { useLocale, LocaleProvider } from "@/lib/locale-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function NotFoundContent() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center">
      <div className="p-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          404 - {t("common.notFound")}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {t("common.pageNotFound")}
        </p>
        <Button asChild>
          <Link href="/">{t("common.backToHome")}</Link>
        </Button>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <LocaleProvider>
      <NotFoundContent />
    </LocaleProvider>
  );
}
