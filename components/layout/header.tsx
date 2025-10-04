"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ShoppingCart, User, LogOut, LayoutDashboard, Heart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "./language-switcher"
import { useState } from "react"
import type { User as UserType } from "@/lib/types"
import { ThemeToggle } from "../theme-toggle"

interface HeaderProps {
  cartItemCount?: number
  user: UserType | null
}

export function Header({ cartItemCount = 0, user: initialUser }: HeaderProps) {
  const { user: authUser, logout, isLoading } = useAuth()
  const { t } = useLocale()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const user = initialUser ?? authUser

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/placeholder-logo.svg" alt={t("app.name")} width={32} height={32} className="h-8 w-8" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t("app.name")}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <LanguageSwitcher />

          {user && user.role === "customer" && (
            <div className="flex items-center gap-2">
              <Link href="/wishlist">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          )}

          {isLoading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    {t("header.profile")}
                  </Link>
                </DropdownMenuItem>
                {user.role === "seller" && (
                  <DropdownMenuItem asChild>
                    <Link href="/seller/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t("header.sellerDashboard")}
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t("header.adminDashboard")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("header.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">{t("header.login")}</Link>
            </Button>
          )}
        </div>
        
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="h-6 w-6" />
            </Button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden container pb-4">
            <nav className="flex flex-col gap-4">
            <div className='flex justify-between items-center'>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {user && user.role === "customer" && (
                <div className="flex items-center gap-2">
                <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                    <Heart className="mr-2 h-5 w-5" />
                    {t("header.wishlist")}
                    </Button>
                </Link>
                <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start relative">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {t("header.cart")}
                    {cartItemCount > 0 && (
                        <Badge className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {cartItemCount}
                        </Badge>
                    )}
                    </Button>
                </Link>
                </div>
            )}

            {isLoading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : user ? (
                <>
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Separator />
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        {t("header.profile")}
                    </Button>
                </Link>
                {user.role === "seller" && (
                    <Link href="/seller/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            {t("header.sellerDashboard")}
                        </Button>
                    </Link>
                )}
                {user.role === "admin" && (
                    <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            {t("header.adminDashboard")}
                        </Button>
                    </Link>
                )}
                <Button variant="ghost" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("header.logout")}
                </Button>
                </>
            ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">{t("header.login")}</Button>
                </Link>
            )}
            </nav>
        </div>
      )}
    </header>
  )
}
