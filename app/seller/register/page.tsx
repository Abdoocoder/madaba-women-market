"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocale } from "@/lib/locale-context"
import { CATEGORIES } from "@/lib/mock-data"

export default function SellerRegisterPage() {
  const { user, signUp } = useAuth()
  const router = useRouter()
  const { t } = useLocale()
  const [formData, setFormData] = useState({
    // Seller personal details (required)
    name: user?.name || "",
    email: user?.email || "",
    phone: "",

    // Store information (required)
    storeName: "",
    storeDescription: "",
    storeCategory: "",

    // Optional fields (can be filled later)
    storeLogo: "",
    instagramUrl: "",
    whatsappUrl: "",
    detailedDescription: "",
    shippingInfo: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  // Handle select changes
  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Validate required fields
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(t("seller.register.nameRequired"))
      return false
    }

    if (!formData.email.trim()) {
      setError(t("seller.register.emailRequired"))
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError(t("seller.register.validEmail"))
      return false
    }

    if (!formData.phone.trim()) {
      setError(t("seller.register.phoneRequired"))
      return false
    }

    if (!formData.storeName.trim()) {
      setError(t("seller.register.storeNameRequired"))
      return false
    }

    if (!formData.storeDescription.trim()) {
      setError(t("seller.register.storeDescriptionRequired"))
      return false
    }

    if (!formData.storeCategory) {
      setError(t("seller.register.storeCategoryRequired"))
      return false
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Validate form
    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    try {
      // If user is not logged in, create an account first
      if (!user) {
        const success = await signUp(formData.email, "TempPass123!", "seller")
        if (!success) {
          throw new Error(t("seller.register.accountCreationFailed"))
        }
      }

      // Register seller information
      const response = await fetch("/api/seller/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t("seller.register.registrationFailed"))
      }

      // Redirect to seller dashboard
      router.push("/seller/dashboard")
    } catch (err) {
      console.error("Seller registration error:", err)
      setError(err instanceof Error ? err.message : t("seller.register.registrationFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{t("seller.register.title")}</CardTitle>
          <CardDescription>{t("seller.register.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seller Personal Information Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-4">{t("seller.register.personalInfo")}</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t("seller.register.name")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("seller.register.email")} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("seller.register.phone")} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Store Information Section */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-medium mb-4">{t("seller.register.storeInfo")}</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeName">{t("seller.register.storeName")} *</Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeCategory">{t("seller.register.storeCategory")} *</Label>
                <Select
                  value={formData.storeCategory}
                  onValueChange={(value) => handleSelectChange(value, "storeCategory")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("seller.register.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="storeDescription">{t("seller.register.storeDescription")} *</Label>
                <Textarea
                  id="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>

              {/* Optional Information Section */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-medium mb-4">{t("seller.register.optionalInfo")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("seller.register.optionalInfoDescription")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagramUrl">{t("seller.register.instagram")}</Label>
                <Input
                  id="instagramUrl"
                  type="url"
                  placeholder="https://instagram.com/yourstore"
                  value={formData.instagramUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappUrl">{t("seller.register.whatsapp")}</Label>
                <Input
                  id="whatsappUrl"
                  type="url"
                  placeholder="https://wa.me/yourphonenumber"
                  value={formData.whatsappUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="detailedDescription">{t("seller.register.detailedDescription")}</Label>
                <Textarea
                  id="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={handleChange}
                  rows={4}
                  placeholder={t("seller.register.detailedDescriptionPlaceholder")}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="shippingInfo">{t("seller.register.shippingInfo")}</Label>
                <Textarea
                  id="shippingInfo"
                  value={formData.shippingInfo}
                  onChange={handleChange}
                  rows={3}
                  placeholder={t("seller.register.shippingInfoPlaceholder")}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("seller.register.submitting") : t("seller.register.submit")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
