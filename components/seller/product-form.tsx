"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORIES } from "@/lib/mock-data"
import { CldUploadWidget } from 'next-cloudinary'
import type { Product } from "@/lib/types"
import { useLocale } from "@/lib/locale-context"

interface ProductFormProps {
  product?: Product
  onSubmit: (data: Partial<Product>, imageUrl?: string) => void
  onCancel: () => void
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const { t } = useLocale()
  const [formData, setFormData] = useState({
    nameAr: product?.nameAr || "",
    descriptionAr: product?.descriptionAr || "",
    price: product?.price || 0,
    category: product?.category || "",
    stock: product?.stock || 0,
  })
  const [imagePreview, setImagePreview] = useState(product?.image || null)
  const [imageUrl, setImageUrl] = useState<string | undefined>(product?.image)

  const handleImageUpload = (result: any) => {
    console.log('🎨 Cloudinary upload result:', result)
    setImagePreview(result.info.secure_url)
    setImageUrl(result.info.secure_url)
  }

  const handleUploadError = (error: any) => {
    console.error('❌ Cloudinary upload error:', error)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, imageUrl)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? t("seller.editProduct") : t("seller.addProduct")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("product.image")}</Label>
            {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned_uploads"}
                onSuccess={handleImageUpload}
                onError={handleUploadError}
                options={{
                  folder: "madaba-women-market",
                  resourceType: "image",
                  maxFileSize: 5000000, // 5MB
                  clientAllowedFormats: ["png", "jpg", "jpeg", "webp"]
                }}
              >
                {({ open }) => (
                  <div
                    className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer relative"
                    onClick={() => open()}
                  >
                    {imagePreview ? (
                      <Image src={imagePreview} alt={t("product.image")} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover rounded-lg" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p>{t("product.uploadImage")}</p>
                        <p className="text-xs">{t("product.recommendedSize")}</p>
                      </div>
                    )}
                  </div>
                )}
              </CldUploadWidget>
            ) : (
              <div className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-100">
                <div className="text-center text-muted-foreground">
                  <p>{t("product.uploadDisabled")}</p>
                  <p className="text-xs">{t("product.cloudinaryNotConfigured")}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameAr">{t("product.name")}</Label>
            <Input
              id="nameAr"
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionAr">{t("product.description")}</Label>
            <Textarea
              id="descriptionAr"
              value={formData.descriptionAr}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t("product.price")} (د.أ)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">{t("product.stock")}</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t("product.category")}</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("filters.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {product ? t("seller.saveChanges") : t("seller.addProductButton")}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
