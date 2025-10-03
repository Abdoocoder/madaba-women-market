"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "ar" | "en"

interface LocaleContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  dir: "rtl" | "ltr"
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

// Translation dictionaries
const translations = {
  ar: {
    // Header
    "app.name": "سيدتي ماركت",
    "header.cart": "السلة",
    "header.login": "تسجيل الدخول",
    "header.logout": "تسجيل الخروج",
    "header.sellerDashboard": "لوحة البائع",
    "header.adminDashboard": "لوحة الإدارة",

    // Home Page
    "home.welcome": "مرحباً بك في سيدتي ماركت",
    "home.subtitle": "اكتشفي أفضل المنتجات من بائعات موثوقات",
    "home.noProducts": "لا توجد منتجات متاحة",

    // Filters
    "filters.search": "ابحثي عن منتج...",
    "filters.categories": "الفئات",
    "filters.allCategories": "جميع الفئات",
    "category.fashion": "أزياء",
    "category.beauty": "جمال",
    "category.accessories": "إكسسوارات",
    "category.home": "منزل",

    // Product Card
    "product.addToCart": "أضف للسلة",
    "product.outOfStock": "نفذت الكمية",
    "product.inStock": "متوفر",

    // Cart
    "cart.title": "سلة التسوق",
    "cart.empty": "سلة التسوق فارغة",
    "cart.startShopping": "ابدأ التسوق",
    "cart.subtotal": "المجموع الفرعي",
    "cart.checkout": "إتمام الطلب",
    "cart.quantity": "الكمية",
    "cart.remove": "حذف",

    // Login
    "login.title": "تسجيل الدخول",
    "login.email": "البريد الإلكتروني",
    "login.password": "كلمة المرور",
    "login.submit": "دخول",
    "login.demoAccounts": "حسابات تجريبية",
    "login.customer": "عميل",
    "login.seller": "بائع",
    "login.admin": "مدير",

    // Seller Dashboard
    "seller.dashboard": "لوحة تحكم البائع",
    "seller.totalProducts": "إجمالي المنتجات",
    "seller.approvedProducts": "المنتجات المعتمدة",
    "seller.totalSales": "إجمالي المبيعات",
    "seller.lowStock": "مخزون منخفض",
    "seller.myProducts": "منتجاتي",
    "seller.addProduct": "إضافة منتج",
    "seller.productName": "اسم المنتج",
    "seller.description": "الوصف",
    "seller.price": "السعر",
    "seller.stock": "المخزون",
    "seller.category": "الفئة",
    "seller.imageUrl": "رابط الصورة",
    "seller.save": "حفظ",
    "seller.cancel": "إلغاء",
    "seller.edit": "تعديل",
    "seller.delete": "حذف",
    "seller.pending": "قيد المراجعة",
    "seller.approved": "معتمد",

    // Admin Dashboard
    "admin.dashboard": "لوحة تحكم الإدارة",
    "admin.totalSellers": "إجمالي البائعين",
    "admin.totalProducts": "إجمالي المنتجات",
    "admin.totalRevenue": "إجمالي الإيرادات",
    "admin.growthRate": "معدل النمو",
    "admin.sellerManagement": "إدارة البائعين",
    "admin.productManagement": "إدارة المنتجات",
    "admin.approve": "قبول",
    "admin.reject": "رفض",
    "admin.feature": "مميز",
    "admin.unfeature": "إلغاء التمييز",
    "admin.joinDate": "تاريخ الانضمام",
    "admin.seller": "البائع",
    "admin.status": "الحالة",
    "admin.actions": "الإجراءات",
  },
  en: {
    // Header
    "app.name": "Seydaty Market",
    "header.cart": "Cart",
    "header.login": "Login",
    "header.logout": "Logout",
    "header.sellerDashboard": "Seller Dashboard",
    "header.adminDashboard": "Admin Dashboard",

    // Home Page
    "home.welcome": "Welcome to Seydaty Market",
    "home.subtitle": "Discover the best products from trusted sellers",
    "home.noProducts": "No products available",

    // Filters
    "filters.search": "Search for a product...",
    "filters.categories": "Categories",
    "filters.allCategories": "All Categories",
    "category.fashion": "Fashion",
    "category.beauty": "Beauty",
    "category.accessories": "Accessories",
    "category.home": "Home",

    // Product Card
    "product.addToCart": "Add to Cart",
    "product.outOfStock": "Out of Stock",
    "product.inStock": "In Stock",

    // Cart
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.startShopping": "Start Shopping",
    "cart.subtotal": "Subtotal",
    "cart.checkout": "Checkout",
    "cart.quantity": "Quantity",
    "cart.remove": "Remove",

    // Login
    "login.title": "Login",
    "login.email": "Email",
    "login.password": "Password",
    "login.submit": "Login",
    "login.demoAccounts": "Demo Accounts",
    "login.customer": "Customer",
    "login.seller": "Seller",
    "login.admin": "Admin",

    // Seller Dashboard
    "seller.dashboard": "Seller Dashboard",
    "seller.totalProducts": "Total Products",
    "seller.approvedProducts": "Approved Products",
    "seller.totalSales": "Total Sales",
    "seller.lowStock": "Low Stock",
    "seller.myProducts": "My Products",
    "seller.addProduct": "Add Product",
    "seller.productName": "Product Name",
    "seller.description": "Description",
    "seller.price": "Price",
    "seller.stock": "Stock",
    "seller.category": "Category",
    "seller.imageUrl": "Image URL",
    "seller.save": "Save",
    "seller.cancel": "Cancel",
    "seller.edit": "Edit",
    "seller.delete": "Delete",
    "seller.pending": "Pending",
    "seller.approved": "Approved",

    // Admin Dashboard
    "admin.dashboard": "Admin Dashboard",
    "admin.totalSellers": "Total Sellers",
    "admin.totalProducts": "Total Products",
    "admin.totalRevenue": "Total Revenue",
    "admin.growthRate": "Growth Rate",
    "admin.sellerManagement": "Seller Management",
    "admin.productManagement": "Product Management",
    "admin.approve": "Approve",
    "admin.reject": "Reject",
    "admin.feature": "Feature",
    "admin.unfeature": "Unfeature",
    "admin.joinDate": "Join Date",
    "admin.seller": "Seller",
    "admin.status": "Status",
    "admin.actions": "Actions",
  },
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar")

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && (savedLang === "ar" || savedLang === "en")) {
      setLanguageState(savedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)

    // Update HTML attributes
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  const dir = language === "ar" ? "rtl" : "ltr"

  return <LocaleContext.Provider value={{ language, setLanguage, t, dir }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
