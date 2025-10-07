"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ShoppingCart, User, LogOut, LayoutDashboard, Heart, Menu, Package } from "lucide-react"
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

// Unified component for user dashboard links
function UserDashboardLinks({ 
  user, 
  t, 
  isMobile = false,
  onCloseMobileMenu 
}: { 
  user: UserType | null; 
  t: (key: string) => string; 
  isMobile?: boolean;
  onCloseMobileMenu?: () => void;
}) {
  if (!user) return null;

  const linkClass = isMobile 
    ? "w-full justify-start" 
    : "cursor-pointer";

  const handleClick = () => {
    if (isMobile && onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  return (
    <>
      {user.role === "customer" && (
        <Link href="/buyer/dashboard" onClick={handleClick}>
          <Button variant="ghost" className={linkClass}>
            <LayoutDashboard className={isMobile ? "mr-2 h-4 w-4" : "mr-2 h-4 w-4"} />
            {t("dashboard.title")}
          </Button>
        </Link>
      )}
      {user.role === "seller" && (
        <Link href="/seller/dashboard" onClick={handleClick}>
          <Button variant="ghost" className={linkClass}>
            <LayoutDashboard className={isMobile ? "mr-2 h-4 w-4" : "mr-2 h-4 w-4"} />
            {t("header.sellerDashboard")}
          </Button>
        </Link>
      )}
      {user.role === "admin" && (
        <Link href="/admin/dashboard" onClick={handleClick}>
          <Button variant="ghost" className={linkClass}>
            <LayoutDashboard className={isMobile ? "mr-2 h-4 w-4" : "mr-2 h-4 w-4"} />
            {t("header.adminDashboard")}
          </Button>
        </Link>
      )}
    </>
  );
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

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/placeholder-logo.svg" alt={t("app.name")} width={32} height={32} className="h-8 w-8" />
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t("app.name")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/products">
            <Button variant="ghost" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t("header.products")}
            </Button>
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher />

          {user && user.role === "customer" && (
            <div className="flex items-center gap-1">
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" title={t("header.wishlist")}>
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative" title={t("header.cart")}>
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
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    {t("header.profile")}
                  </Link>
                </DropdownMenuItem>
                <UserDashboardLinks user={user} t={t} />
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
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="h-6 w-6" />
            </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container py-4">
            <nav className="flex flex-col gap-3">
              {/* Mobile Theme and Language Controls */}
              <div className='flex justify-between items-center pb-2'>
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              
              <Separator />
              
              {/* Mobile Navigation Links */}
              <Link href="/products" onClick={handleCloseMobileMenu}>
                <Button variant="ghost" className="w-full justify-start">
                  <Package className="mr-2 h-5 w-5" />
                  {t("header.products")}
                </Button>
              </Link>

              {/* Mobile Customer Actions */}
              {user && user.role === "customer" && (
                <>
                  <Link href="/wishlist" onClick={handleCloseMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Heart className="mr-2 h-5 w-5" />
                      {t("header.wishlist")}
                    </Button>
                  </Link>
                  <Link href="/cart" onClick={handleCloseMobileMenu}>
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
                </>
              )}

              <Separator />

              {/* Mobile User Section */}
              {isLoading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : user ? (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Separator />
                  <Link href="/profile" onClick={handleCloseMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      {t("header.profile")}
                    </Button>
                  </Link>
                  <UserDashboardLinks 
                    user={user} 
                    t={t} 
                    isMobile={true} 
                    onCloseMobileMenu={handleCloseMobileMenu} 
                  />
                  <Button 
                    variant="ghost" 
                    onClick={() => { handleLogout(); handleCloseMobileMenu(); }} 
                    className="w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("header.logout")}
                  </Button>
                </>
              ) : (
                <Link href="/login" onClick={handleCloseMobileMenu}>
                  <Button className="w-full">{t("header.login")}</Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}